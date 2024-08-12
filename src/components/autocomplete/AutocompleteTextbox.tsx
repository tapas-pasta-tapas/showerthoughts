'use client';

import React, { useRef, useEffect, SyntheticEvent, KeyboardEvent } from "react";
import assert from "assert";
import { v4 as uuidv4 } from "uuid";
import { LRUCache } from 'lru-cache';
import Suggestion, { suggestionIdAttribute } from "./Suggestion";
import {
  isCaretAtLineEnd,
  generateSuggestionElement,
  getTextUptilCaretInElement,
  insertNodeAtCaret,
} from "./utils";
import {
  AutocompleteTextboxProps,
  SuggestionInfo,
  SuggestionRemovalReason,
  GetSuggestionFn,
} from "./types";

export default function AutocompleteTextbox({
  disableAutocomplete,
  debounceTime,
  disabled,
  value,
  suggestionClassName,
  suggestionStyle,
  getSuggestion,
  onContentChange,
  onSuggestionShown,
  onSuggestionAccepted,
  onSuggestionRejected,
  ...props
}: AutocompleteTextboxProps) {
  const DEBOUNCE_TIME = debounceTime || 1000;
  const textbox = useRef<HTMLDivElement | null>(null);
  const timer = useRef<NodeJS.Timeout>(setTimeout(() => {}, 0));
  const disableSelectionEvent = useRef<boolean>(false);
  const abortController = useRef(new AbortController());
  const suggestionCache = useRef(new LRUCache<string, string>({ max: 25 }));

  const isSuggestionDisplayed = (): boolean => {
    const suggestionElements = textbox.current?.querySelectorAll(
      `[${suggestionIdAttribute}]`
    );
    if (!suggestionElements) return false;
    return suggestionElements.length > 0;
  };

  const getCurrentSuggestionElement = (): Element | null => {
    const suggestionElements = textbox.current?.querySelectorAll(
      `[${suggestionIdAttribute}]`
    );
    return suggestionElements?.[0] || null;
  };

  const showSuggestionAtCaret = async (
    getSuggestion: GetSuggestionFn
  ): Promise<void> => {
    removeSuggestionIfDisplayed(SuggestionRemovalReason.SYSTEM);

    const textUptilCaret = getTextUptilCaretInElement(textbox.current!);
    const timeBefore = Date.now();
    let suggestionText = suggestionCache.current.get(textUptilCaret);
    if (!suggestionText) {
      abortController.current = new AbortController();
      suggestionText = await getSuggestion(
        textUptilCaret,
        abortController.current.signal
      );
      if (!suggestionText) return;
      suggestionCache.current.set(textUptilCaret, suggestionText);
    }
    const timeAfter = Date.now();

    const textUptilCaretAfterFetch = getTextUptilCaretInElement(
      textbox.current!
    );
    if (textUptilCaret !== textUptilCaretAfterFetch) return;

    const suggestionId = "s-" + uuidv4();
    const suggestionElement = generateSuggestionElement(
      suggestionText,
      suggestionId,
      suggestionClassName,
      suggestionStyle
    );
    const isSuccessfullyInserted = insertNodeAtCaret(
      suggestionElement,
      textbox.current!,
      true
    );

    if (isSuccessfullyInserted) {
      const suggestionInfo: SuggestionInfo = {
        id: suggestionId,
        timeShown: Date.now(),
        latency: timeAfter - timeBefore,
        suggestionText: suggestionText,
        leadingText: textUptilCaret,
        getFullHTML: () => textbox.current?.innerHTML || "",
      };
      onSuggestionShown?.(suggestionInfo);
    }
  };

  const removeSuggestionIfDisplayed = (
    reason: SuggestionRemovalReason
  ): void => {
    const suggestionElements = textbox.current?.querySelectorAll(
      `[${suggestionIdAttribute}]`
    );
    if (!suggestionElements) return;
    suggestionElements.forEach((suggestionElement) => {
      const suggestionId = suggestionElement.getAttribute(suggestionIdAttribute)!;
      suggestionElement.remove();
      if (reason !== SuggestionRemovalReason.SYSTEM) {
        onSuggestionRejected?.({
          suggestionId,
          timeRejected: Date.now(),
          reason,
        });
      }
    });
  };

  const handleInput = (event: SyntheticEvent<HTMLDivElement>): void => {
    if (disableAutocomplete) {
      onContentChange?.(textbox.current?.innerHTML || "");
      return;
    }

    if (isSuggestionDisplayed()) {
      const justTyped = (event.nativeEvent as InputEvent).data;
      const suggestionText = getCurrentSuggestionElement()!.textContent!;
      const inputMatchesSuggestion =
        justTyped && suggestionText?.startsWith(justTyped);
      if (inputMatchesSuggestion) {
        removeSuggestionIfDisplayed(SuggestionRemovalReason.IMPLICIT);
        onContentChange?.(textbox.current?.innerHTML || "");

        const remainingSuggestion = suggestionText!.substring(
          justTyped!.length
        );
        if (remainingSuggestion) {
          showSuggestionAtCaret(() => remainingSuggestion);
          disableSelectionEvent.current = true;
        }
        return;
      }
    }
    removeSuggestionIfDisplayed(SuggestionRemovalReason.IMPLICIT);

    onContentChange?.(textbox.current?.innerHTML || "");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (disableAutocomplete) return;

    if (event.key === "Escape") {
      event.preventDefault();
      removeSuggestionIfDisplayed(SuggestionRemovalReason.EXPLICIT);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      if (!isSuggestionDisplayed()) return;

      const suggestion = getCurrentSuggestionElement()!;
      const suggestionText = suggestion.textContent;
      assert(suggestionText);
      const suggestionId = suggestion.getAttribute(suggestionIdAttribute)!;
      removeSuggestionIfDisplayed(SuggestionRemovalReason.SYSTEM);
      const textNode = document.createTextNode(suggestionText);
      const isInserted = insertNodeAtCaret(
        textNode,
        textbox.current!,
        false,
        true
      );
      if (!isInserted) return;

      onSuggestionAccepted?.({
        suggestionId,
        timeAccepted: Date.now(),
      });

      const simulatedEvent = new Event("input", { bubbles: true });
      textbox.current?.dispatchEvent(simulatedEvent);
      return;
    }
  };

  const clearTimerAndAbortFetch = () => {
    clearTimeout(timer.current);
    abortController.current.abort();
  };

  const handleSelection = (event: SyntheticEvent<HTMLDivElement>) => {
    if (disableAutocomplete) return;

    if (disableSelectionEvent.current) {
      disableSelectionEvent.current = false;
      return;
    }

    removeSuggestionIfDisplayed(SuggestionRemovalReason.IMPLICIT);
    clearTimerAndAbortFetch();

    const selection = window.getSelection();
    if (!selection || !selection.isCollapsed) return;

    assert(textbox.current);
    const showSuggestion = isCaretAtLineEnd(selection, textbox.current);

    if (showSuggestion) {
      timer.current = setTimeout(
        async () => await showSuggestionAtCaret(getSuggestion),
        DEBOUNCE_TIME
      );
    }
  };

  const handleBlur = () => {
    removeSuggestionIfDisplayed(SuggestionRemovalReason.IMPLICIT);
    clearTimerAndAbortFetch();
  };

  return (
    <div
      contentEditable={disabled ? "false" : "true"}
      suppressContentEditableWarning={true}
      ref={textbox}
      onInput={(event) => handleInput(event)}
      onSelect={(event) => handleSelection(event)}
      onKeyDown={(event) => handleKeyDown(event)}
      onBlur={handleBlur}
      {...props}
    >
      {value || null}
    </div>
  );
}
