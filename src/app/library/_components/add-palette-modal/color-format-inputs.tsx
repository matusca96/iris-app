import { useEffect, useState } from "react";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	type OklchTriplet,
	parseColorInputToTriplet,
	tripletsAlmostEqual,
	tripletToDisplayFormats,
} from "./add-palette-modal.helpers";

type FormatKey = "oklch" | "rgb" | "hex" | "hsl";

const FORMAT_FIELDS: { id: FormatKey; label: string }[] = [
	{ id: "oklch", label: "OKLCH" },
	{ id: "rgb", label: "RGB" },
	{ id: "hex", label: "HEX" },
	{ id: "hsl", label: "HSL" },
];

export const ColorFormatInputs = ({
	onWorkingColorChange,
	workingColor,
}: {
	onWorkingColorChange: (next: OklchTriplet) => void;
	workingColor: OklchTriplet;
}) => {
	const formats = tripletToDisplayFormats(workingColor);
	const [focusedKey, setFocusedKey] = useState<FormatKey | null>(null);
	const [drafts, setDrafts] = useState<Partial<Record<FormatKey, string>>>({});

	useEffect(() => {
		if (!focusedKey) {
			return;
		}
		const nextFormats = tripletToDisplayFormats(workingColor);
		setDrafts((d) => ({ ...d, [focusedKey]: nextFormats[focusedKey] }));
	}, [focusedKey, workingColor]);

	const valueFor = (key: FormatKey) =>
		focusedKey === key ? (drafts[key] ?? formats[key]) : formats[key];

	return (
		<>
			{FORMAT_FIELDS.map(({ id, label }) => (
				<Field key={id}>
					<FieldLabel htmlFor={`palette-format-${id}`}>{label}</FieldLabel>
					<Input
						autoComplete="off"
						className="font-mono text-sm"
						id={`palette-format-${id}`}
						onBlur={() => {
							const raw = (drafts[id] ?? formats[id]).trim();
							const canonical = formats[id].trim();
							if (raw === canonical) {
								setFocusedKey(null);
								setDrafts((d) => {
									const next = { ...d };
									delete next[id];
									return next;
								});
								return;
							}

							const triplet = parseColorInputToTriplet(raw);
							if (triplet && !tripletsAlmostEqual(triplet, workingColor)) {
								onWorkingColorChange(triplet);
							}
							setFocusedKey(null);
							setDrafts((d) => {
								const next = { ...d };
								delete next[id];
								return next;
							});
						}}
						onChange={(e) => {
							setDrafts((d) => ({ ...d, [id]: e.target.value }));
						}}
						onFocus={() => {
							setFocusedKey(id);
							setDrafts((d) => ({ ...d, [id]: formats[id] }));
						}}
						spellCheck={false}
						value={valueFor(id)}
					/>
				</Field>
			))}
		</>
	);
};
