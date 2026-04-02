"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { Children, forwardRef, isValidElement, useMemo, useState } from "react";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

const EMPTY_VALUE = "__placeholder__";

type SelectChangeEvent = {
  target: {
    id?: string;
    name?: string;
    value: string;
  };
};

interface SelectProps {
  children: ReactNode;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  onChange?: (event: SelectChangeEvent) => void;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: "default" | "sm";
  value?: string;
}

function extractOptions(children: ReactNode) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child) || child.type !== "option") {
      return [];
    }

    const {
      children: label,
      disabled,
      value,
    } = child.props as {
      children?: ReactNode;
      disabled?: boolean;
      value?: string;
    };

    return [
      {
        disabled: Boolean(disabled),
        label,
        value: value == null ? "" : String(value),
      },
    ];
  });
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      children,
      className,
      defaultValue = "",
      disabled,
      id,
      name,
      onChange,
      onClick,
      size = "default",
      value,
    },
    ref,
  ) {
    const options = useMemo(() => extractOptions(children), [children]);
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const currentValue = value ?? uncontrolledValue;
    const currentOption = options.find(
      (option) => option.value === currentValue,
    );
    const placeholderOption = options.find((option) => option.value === "");
    const radixValue = currentValue === "" ? EMPTY_VALUE : currentValue;

    const handleValueChange = (nextValue: string) => {
      const resolvedValue = nextValue === EMPTY_VALUE ? "" : nextValue;

      if (value === undefined) {
        setUncontrolledValue(resolvedValue);
      }

      onChange?.({
        target: {
          id,
          name,
          value: resolvedValue,
        },
      });
    };

    return (
      <SelectPrimitive.Root
        disabled={disabled}
        value={radixValue}
        onValueChange={handleValueChange}
      >
        {name ? <input type="hidden" name={name} value={currentValue} /> : null}
        <SelectPrimitive.Trigger
          ref={ref}
          id={id}
          onClick={onClick}
          className={cn(
            "group border-border bg-input/90 data-face text-foreground focus-visible:ring-accent/30 hover:border-border hover:bg-panel/80 relative flex w-full items-center justify-between text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_30px_rgba(0,0,0,0.16)] transition duration-200 outline-none before:pointer-events-none before:absolute before:inset-px before:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] hover:-translate-y-px focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55",
            size === "sm"
              ? "h-9 gap-2 rounded-2xl border px-3 py-1.5 text-[13px] before:rounded-[15px]"
              : "h-11 gap-3 rounded-xl border px-4 py-2 text-sm before:rounded-[11px]",
            className,
          )}
        >
          <span className="relative z-10 min-w-0 flex-1 truncate">
            <SelectPrimitive.Value
              placeholder={placeholderOption?.label ?? "Select an option"}
            >
              {currentOption?.label}
            </SelectPrimitive.Value>
          </span>
          <span
            className={cn(
              "border-border/70 bg-panel/80 relative z-10 inline-flex shrink-0 items-center justify-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
              size === "sm" ? "size-6" : "size-7",
            )}
          >
            <SelectPrimitive.Icon>
              <ChevronDown
                className={cn(
                  "text-muted-foreground transition duration-200 group-data-[state=open]:rotate-180",
                  size === "sm" ? "size-3.5" : "size-4",
                )}
              />
            </SelectPrimitive.Icon>
          </span>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={10}
            className="border-border/80 bg-panel/95 text-foreground data-face data-[side=bottom]:animate-in data-[side=bottom]:fade-in-0 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:animate-in data-[side=top]:fade-in-0 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-[18px] border p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.46)] backdrop-blur-xl"
          >
            <SelectPrimitive.Viewport className="space-y-1">
              {options.map((option) => {
                const optionValue =
                  option.value === "" ? EMPTY_VALUE : option.value;

                return (
                  <SelectPrimitive.Item
                    key={optionValue}
                    value={optionValue}
                    disabled={option.disabled}
                    className="data-highlighted:bg-accent/12 data-highlighted:text-foreground data-[state=checked]:bg-muted/65 relative flex min-h-10 cursor-default items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-sm transition outline-none data-disabled:pointer-events-none data-disabled:opacity-35"
                  >
                    <span className="border-border/70 bg-muted/40 inline-flex size-5 shrink-0 items-center justify-center rounded-full border">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="text-accent size-3.5" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>
                      {option.label}
                    </SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                );
              })}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  },
);
