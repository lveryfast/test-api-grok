'use client';

import { Check, Pencil } from 'lucide-react';
import { VideoStyle } from '@/types/video';

interface StyleCardProps {
  style: VideoStyle;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  showEditButton?: boolean;
  isEdited?: boolean;
}

export function StyleCard({
  style,
  isSelected,
  onSelect,
  onEdit,
  showEditButton = true,
  isEdited = false,
}: StyleCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={`
        relative h-auto min-h-[120px] p-4 rounded-lg border-2 text-left transition-all cursor-pointer
        ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md hover:shadow-primary/10'}
        ${isEdited ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background' : ''}
        ${isSelected ? 'glow-green' : ''}
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-8">
          <Check className="h-5 w-5 text-primary" />
        </div>
      )}
      {isEdited && (
        <div className="absolute top-1 right-1">
          <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
            Editado
          </span>
        </div>
      )}
      <h3 className="font-semibold mb-2 pr-8">{style.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-3">{style.description}</p>
      {showEditButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute bottom-2 right-2 p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
          aria-label="Editar estilo"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
