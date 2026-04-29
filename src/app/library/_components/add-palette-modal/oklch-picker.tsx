"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
	buildChromaTrackGradient,
	buildHueTrackGradient,
	buildLightnessTrackGradient,
	type OklchTriplet,
	tripletsAlmostEqual,
} from "./add-palette-modal.helpers";
import {
	type OklchSwatch,
	PRESET_OKLCH_SWATCHES,
} from "./default-oklch-swatches";

type OklchPickerProps = {
	className?: string;
	onChange: (next: OklchTriplet) => void;
	value: OklchTriplet;
};

const SWATCH_SIZE = "clamp(1.5rem, 4vw, 1.85rem)";

/** Grid is `grid-flow-col` + `grid-rows-8` → column-major order (8 rows per column). */
const SWATCH_GRID_ROWS = 8;
const PRESET_SWATCH_COUNT = PRESET_OKLCH_SWATCHES.length;
const SWATCH_COLS = PRESET_SWATCH_COUNT / SWATCH_GRID_ROWS;

/** Fixed row height + vertical centering so the gradient matches the track + thumb (`size-4` thumb fits comfortably). */
const sliderTrackRowClassName = "relative flex w-full shrink-0 items-center";

export const OklchPicker = ({
	className,
	onChange,
	value,
}: OklchPickerProps) => {
	const [swatchTabStopIndex, setSwatchTabStopIndex] = useState(0);

	const swatchButtonsRef = useRef<Array<HTMLButtonElement | null>>([]);
	const swatchRegionRef = useRef<HTMLDivElement>(null);
	const shouldSelectOnFocusRef = useRef(false);

	const lightnessGradient = buildLightnessTrackGradient(value.c, value.h);
	const chromaGradient = buildChromaTrackGradient(value.l, value.h);
	const hueGradient = buildHueTrackGradient(value.l, value.c);

	useEffect(() => {
		const root = swatchRegionRef.current;
		if (!root) {
			return;
		}
		const onFocusOut = (event: globalThis.FocusEvent) => {
			const next = event.relatedTarget;
			if (next instanceof Node && root.contains(next)) {
				return;
			}
			setSwatchTabStopIndex(0);
		};
		root.addEventListener("focusout", onFocusOut);
		return () => {
			root.removeEventListener("focusout", onFocusOut);
		};
	}, []);

	const focusSwatch = (index: number) => {
		if (index < 0 || index >= PRESET_SWATCH_COUNT) {
			return;
		}
		setSwatchTabStopIndex(index);
		requestAnimationFrame(() => {
			swatchButtonsRef.current[index]?.focus();
		});
	};

	const onSwatchKeyDown = (
		index: number,
		event: KeyboardEvent<HTMLButtonElement>
	) => {
		const { key } = event;
		if (
			key !== "ArrowDown" &&
			key !== "ArrowUp" &&
			key !== "ArrowLeft" &&
			key !== "ArrowRight" &&
			key !== "Home" &&
			key !== "End"
		) {
			return;
		}
		event.preventDefault();
		shouldSelectOnFocusRef.current = true;
		const row = index % SWATCH_GRID_ROWS;
		const col = Math.floor(index / SWATCH_GRID_ROWS);

		if (key === "Home") {
			focusSwatch(0);
			return;
		}
		if (key === "End") {
			focusSwatch(PRESET_SWATCH_COUNT - 1);
			return;
		}
		if (key === "ArrowUp" && row > 0) {
			focusSwatch(index - 1);
			return;
		}
		if (key === "ArrowDown" && row < SWATCH_GRID_ROWS - 1) {
			focusSwatch(index + 1);
			return;
		}
		if (key === "ArrowLeft" && col > 0) {
			focusSwatch(index - SWATCH_GRID_ROWS);
			return;
		}
		if (key === "ArrowRight" && col < SWATCH_COLS - 1) {
			focusSwatch(index + SWATCH_GRID_ROWS);
		}
	};

	return (
		<div className={cn("flex min-w-0 flex-col gap-4", className)}>
			<div
				className="grid max-h-[min(40vh,22rem)] auto-cols-(--sw) grid-flow-col grid-rows-8 gap-1 overflow-x-auto p-3 pr-1.5 pb-1 [--sw:var(--swatch-size)]"
				ref={swatchRegionRef}
				style={
					{
						"--swatch-size": SWATCH_SIZE,
					} as CSSProperties
				}
			>
				{PRESET_OKLCH_SWATCHES.map(
					(swatch: OklchSwatch & { id: string }, index) => {
						const selected = tripletsAlmostEqual(value, swatch);
						return (
							<button
								aria-label={`Cor preset ${swatch.id}`}
								className={cn(
									"oklch-preset-swatch size-(--swatch-size)",
									selected &&
										"ring-2 ring-primary ring-offset-2 ring-offset-background"
								)}
								key={swatch.id}
								onClick={() => {
									setSwatchTabStopIndex(index);
									onChange({
										l: swatch.l,
										c: swatch.c,
										h: swatch.h,
									});
								}}
								onFocus={() => {
									setSwatchTabStopIndex(index);
									if (!shouldSelectOnFocusRef.current) {
										return;
									}
									shouldSelectOnFocusRef.current = false;
									onChange({ l: swatch.l, c: swatch.c, h: swatch.h });
								}}
								onKeyDown={(e) => {
									onSwatchKeyDown(index, e);
								}}
								ref={(el) => {
									swatchButtonsRef.current[index] = el;
								}}
								style={{
									background: `oklch(${swatch.l} ${swatch.c} ${swatch.h})`,
								}}
								tabIndex={swatchTabStopIndex === index ? 0 : -1}
								type="button"
							/>
						);
					}
				)}
			</div>

			<div className="flex min-w-0 flex-col gap-4 p-3 pt-0">
				<div className="flex flex-col gap-2">
					<div className="flex justify-between gap-2 text-muted-foreground text-sm">
						<span>Luminosidade</span>
						<strong className="font-mono text-foreground tabular-nums">
							{(value.l * 100).toFixed(1)}%
						</strong>
					</div>
					<div className={sliderTrackRowClassName}>
						<div
							className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full opacity-90"
							style={{ background: lightnessGradient }}
						/>
						<Slider
							aria-label="Luminosidade"
							className="relative z-10 w-full [&_[data-slot=slider-track]]:bg-transparent"
							hideRange
							max={100}
							min={0}
							onValueChange={(v) => {
								const n = Array.isArray(v) ? v[0] : v;
								if (typeof n !== "number") {
									return;
								}
								onChange({ ...value, l: n / 100 });
							}}
							step={0.1}
							value={[value.l * 100]}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex justify-between gap-2 text-muted-foreground text-sm">
						<span>Croma</span>
						<strong className="font-mono text-foreground tabular-nums">
							{value.c.toFixed(3)}
						</strong>
					</div>
					<div className={sliderTrackRowClassName}>
						<div
							className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full opacity-90"
							style={{ background: chromaGradient }}
						/>
						<Slider
							aria-label="Croma"
							className="relative z-10 w-full [&_[data-slot=slider-track]]:bg-transparent"
							hideRange
							max={0.4}
							min={0}
							onValueChange={(v) => {
								const n = Array.isArray(v) ? v[0] : v;
								if (typeof n !== "number") {
									return;
								}
								onChange({ ...value, c: n });
							}}
							step={0.001}
							value={[value.c]}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex justify-between gap-2 text-muted-foreground text-sm">
						<span>Matiz</span>
						<strong className="font-mono text-foreground tabular-nums">
							{value.h.toFixed(1)}°
						</strong>
					</div>
					<div className={sliderTrackRowClassName}>
						<div
							className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full opacity-90"
							style={{ background: hueGradient }}
						/>
						<Slider
							aria-label="Matiz"
							className="relative z-10 w-full [&_[data-slot=slider-track]]:bg-transparent"
							hideRange
							max={360}
							min={0}
							onValueChange={(v) => {
								const n = Array.isArray(v) ? v[0] : v;
								if (typeof n !== "number") {
									return;
								}
								onChange({ ...value, h: n });
							}}
							step={0.1}
							value={[value.h]}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
