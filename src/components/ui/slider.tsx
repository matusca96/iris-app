import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

function Slider({
	className,
	defaultValue,
	hideRange,
	value,
	min = 0,
	max = 100,
	...props
}: SliderPrimitive.Root.Props & { hideRange?: boolean }) {
	let _values: number[];
	if (Array.isArray(value)) {
		_values = value as number[];
	} else if (Array.isArray(defaultValue)) {
		_values = defaultValue as number[];
	} else {
		_values = [min, max];
	}

	return (
		<SliderPrimitive.Root
			className={cn("data-vertical:h-full data-horizontal:w-full", className)}
			data-slot="slider"
			defaultValue={defaultValue}
			max={max}
			min={min}
			value={value}
			{...props}
		>
			<SliderPrimitive.Control className="relative flex w-full touch-none select-none items-center data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col data-disabled:opacity-50">
				<SliderPrimitive.Track
					className="relative grow select-none overflow-hidden rounded-full bg-muted data-horizontal:h-1.5 data-vertical:h-full data-horizontal:w-full data-vertical:w-1.5"
					data-slot="slider-track"
				>
					{hideRange ? null : (
						<SliderPrimitive.Indicator
							className="select-none bg-primary data-horizontal:h-full data-vertical:w-full"
							data-slot="slider-range"
						/>
					)}
				</SliderPrimitive.Track>
				{_values.map((thumbValue, thumbIndex) => (
					<SliderPrimitive.Thumb
						className="block size-4 shrink-0 select-none rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
						data-slot="slider-thumb"
						key={`${String(thumbIndex)}-${String(thumbValue)}`}
					/>
				))}
			</SliderPrimitive.Control>
		</SliderPrimitive.Root>
	);
}

export { Slider };
