"use client";

import {
	ArrowDown01Icon,
	Image01Icon,
	PaintBoardIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AddImageModal } from "@/app/library/_components/add-image-modal/add-image-modal";
import { AddPaletteModal } from "@/app/library/_components/add-palette-modal/add-palette-modal";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContentStore } from "@/store/content";
import { CollectionDetailImages } from "./_components/collection-detail-images";
import { CollectionDetailPalettes } from "./_components/collection-detail-palettes";
import { CollectionTitleEditor } from "./_components/collection-title-editor";
import { DeleteCollectionDialog } from "./_components/delete-collection-dialog";
import {
	type SelectFromLibraryKind,
	SelectFromLibraryModal,
} from "./_components/select-from-library-modal";

export default function CollectionPage() {
	const params = useParams();
	const router = useRouter();
	const collectionId = params.id as string;

	const groups = useContentStore((s) => s.groups);
	const images = useContentStore((s) => s.images);
	const palettes = useContentStore((s) => s.palettes);
	const deleteGroup = useContentStore((s) => s.deleteGroup);

	const group = groups.find((g) => g.id === collectionId);

	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [paletteModalOpen, setPaletteModalOpen] = useState(false);
	const [libraryPicker, setLibraryPicker] = useState<{
		kind: SelectFromLibraryKind;
	} | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const presetGroupIds = useMemo(() => [collectionId], [collectionId]);

	const collectionImages = useMemo(
		() => images.filter((i) => i.groupIds.includes(collectionId)),
		[collectionId, images]
	);
	const collectionPalettes = useMemo(
		() => palettes.filter((p) => p.groupIds.includes(collectionId)),
		[collectionId, palettes]
	);

	const handleDeleteConfirm = () => {
		deleteGroup(collectionId);
		toast.success("Coleção excluída com sucesso.");
		router.push("/collections" as Route);
	};

	if (!group) {
		return (
			<div className="mt-6 space-y-4">
				<p className="text-muted-foreground">Coleção não encontrada.</p>
				<Link
					className="font-medium text-primary text-sm underline underline-offset-4 hover:underline"
					href={"/collections" as Route}
				>
					Voltar às coleções
				</Link>
			</div>
		);
	}

	return (
		<div className="mt-2 space-y-8 pb-16">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex-1 space-y-1">
						<CollectionTitleEditor groupId={group.id} groupName={group.name} />
						<p className="text-muted-foreground text-sm">
							{collectionImages.length} imagens · {collectionPalettes.length}{" "}
							paletas
						</p>
					</div>
					<Button
						onClick={() => setDeleteOpen(true)}
						type="button"
						variant="destructive"
					>
						Excluir coleção
					</Button>
				</div>
			</div>

			<section className="space-y-3 rounded-xl border border-border bg-card/40 p-4">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Imagens
					</h2>
					<DropdownMenu>
						<DropdownMenuTrigger
							className="gap-2"
							render={<Button size="sm" type="button" variant="outline" />}
						>
							<HugeiconsIcon icon={Image01Icon} />
							Adicionar imagens
							<HugeiconsIcon
								className="text-muted-foreground"
								icon={ArrowDown01Icon}
								strokeWidth={2}
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="min-w-56">
							<DropdownMenuItem
								onClick={() => setLibraryPicker({ kind: "images" })}
							>
								Selecionar da biblioteca
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setImageModalOpen(true)}>
								Criar nova imagem
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				{collectionImages.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						Nenhuma imagem nesta coleção.
					</p>
				) : (
					<CollectionDetailImages
						collectionId={collectionId}
						images={collectionImages}
					/>
				)}
			</section>

			<section className="space-y-3 rounded-xl border border-border bg-card/40 p-4">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Paletas
					</h2>
					<DropdownMenu>
						<DropdownMenuTrigger
							className="gap-2"
							render={<Button size="sm" type="button" variant="outline" />}
						>
							<HugeiconsIcon icon={PaintBoardIcon} />
							Adicionar paletas
							<HugeiconsIcon
								className="text-muted-foreground"
								icon={ArrowDown01Icon}
								strokeWidth={2}
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="min-w-56">
							<DropdownMenuItem
								onClick={() => setLibraryPicker({ kind: "palettes" })}
							>
								Selecionar da biblioteca
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setPaletteModalOpen(true)}>
								Criar nova paleta
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				{collectionPalettes.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						Nenhuma paleta nesta coleção.
					</p>
				) : (
					<CollectionDetailPalettes
						collectionId={collectionId}
						palettes={collectionPalettes}
					/>
				)}
			</section>

			<AddImageModal
				defaultGroupIds={presetGroupIds}
				lockedGroupIds={presetGroupIds}
				onOpenChange={setImageModalOpen}
				open={imageModalOpen}
			/>
			<AddPaletteModal
				defaultGroupIds={presetGroupIds}
				lockedGroupIds={presetGroupIds}
				onOpenChange={setPaletteModalOpen}
				open={paletteModalOpen}
			/>
			<SelectFromLibraryModal
				groupId={group.id}
				groupName={group.name}
				kind={libraryPicker?.kind ?? "images"}
				onOpenChange={(next) => {
					if (!next) {
						setLibraryPicker(null);
					}
				}}
				open={libraryPicker !== null}
			/>
			<DeleteCollectionDialog
				onConfirm={handleDeleteConfirm}
				onOpenChange={setDeleteOpen}
				open={deleteOpen}
			/>
		</div>
	);
}
