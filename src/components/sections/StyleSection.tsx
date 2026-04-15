'use client';

import { useState } from 'react';
import { useVideoStore } from '@/hooks/useVideoStore';
import { VIDEO_STYLES, CHARACTER_LIMITS } from '@/types/constants';
import { VideoStyle } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Plus, Check, Trash2 } from 'lucide-react';

export function StyleSection() {
  const {
    selectedStyle,
    customStyles,
    editedStyles,
    setSelectedStyle,
    addCustomStyle,
    updateCustomStyle,
    removeCustomStyle,
    updatePredefinedStyle,
  } = useVideoStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<VideoStyle | null>(null);
  const [editingStyleOriginalId, setEditingStyleOriginalId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  // Get effective styles (with edits applied)
  const getEffectiveStyle = (originalStyle: VideoStyle): VideoStyle => {
    return editedStyles[originalStyle.id] || originalStyle;
  };

  const allStyles = [
    ...VIDEO_STYLES.map((style) => getEffectiveStyle(style)),
    ...customStyles,
  ];

  const handleEditStyle = (style: VideoStyle, originalId?: string) => {
    setEditingStyle(style);
    setEditingStyleOriginalId(originalId || style.id);
    setCustomTitle(style.title);
    setCustomDescription(style.description);
    setIsDialogOpen(true);
  };

  const handleSaveStyle = () => {
    if (!customTitle.trim() || !customDescription.trim()) return;

    if (editingStyleOriginalId && VIDEO_STYLES.some((s) => s.id === editingStyleOriginalId)) {
      // Editing a predefined style
      updatePredefinedStyle(editingStyleOriginalId, {
        title: customTitle.trim(),
        description: customDescription.trim(),
      });
    } else if (editingStyle?.isCustom) {
      // Editing a custom style
      updateCustomStyle(editingStyle.id, {
        title: customTitle.trim(),
        description: customDescription.trim(),
      });
    } else {
      // Creating a new custom style
      const newStyle: VideoStyle = {
        id: `custom-${Date.now()}`,
        title: customTitle.trim(),
        description: customDescription.trim(),
        isCustom: true,
      };
      addCustomStyle(newStyle);
    }

    closeDialog();
  };

  const handleDeleteStyle = (styleId: string) => {
    removeCustomStyle(styleId);
    if (selectedStyle?.id === styleId) {
      setSelectedStyle(null);
    }
    closeDialog();
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingStyle(null);
    setEditingStyleOriginalId(null);
    setCustomTitle('');
    setCustomDescription('');
  };

  const isEditing = editingStyle?.isCustom;

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Estilo de Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allStyles.map((style) => {
            const isPredefined = !style.isCustom;
            const isEdited = isPredefined && editedStyles[style.id];

            return (
              <StyleCard
                key={style.id}
                style={style}
                isSelected={selectedStyle?.id === style.id}
                onSelect={() => setSelectedStyle(style)}
                onEdit={() => handleEditStyle(style, isPredefined ? style.id : undefined)}
                showEditButton={true}
                isEdited={!!isEdited}
              />
            );
          })}

          {/* Add Custom Style Button */}
          <Button
            variant="outline"
            className="h-auto min-h-[120px] flex flex-col items-center justify-center gap-2 border-dashed"
            onClick={() => {
              setEditingStyle(null);
              setEditingStyleOriginalId(null);
              setCustomTitle('');
              setCustomDescription('');
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-6 w-6" />
            <span>Agregar Estilo</span>
          </Button>
        </div>

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStyle
                  ? isEditing
                    ? 'Editar Estilo Personalizado'
                    : 'Editar Estilo Predeterminado'
                  : 'Nuevo Estilo Personalizado'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica el estilo personalizado.'
                  : editingStyle
                  ? 'Modifica el estilo predeterminado. Los cambios solo aplican a esta sesión.'
                  : 'Crea un nuevo estilo con tu propia descripción.'}
                <br />
                <span className="text-xs">
                  Máximo {CHARACTER_LIMITS.CUSTOM_STYLE_DESCRIPTION} caracteres para la descripción.
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="style-title">Título</Label>
                <Input
                  id="style-title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ej: Estilo Mi Empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style-description">Descripción del Prompt</Label>
                <Textarea
                  id="style-description"
                  value={customDescription}
                  onChange={(e) =>
                    setCustomDescription(
                      e.target.value.slice(0, CHARACTER_LIMITS.CUSTOM_STYLE_DESCRIPTION)
                    )
                  }
                  placeholder="Describe el estilo visual del video..."
                  className="min-h-[100px]"
                />
                <div className="text-sm text-muted-foreground text-right">
                  {customDescription.length}/{CHARACTER_LIMITS.CUSTOM_STYLE_DESCRIPTION}
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row gap-2 sm:gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDeleteStyle(editingStyle!.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
              <div className="flex-1" />
              <Button variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveStyle}
                disabled={!customTitle.trim() || !customDescription.trim()}
              >
                {editingStyle ? 'Guardar Cambios' : 'Crear Estilo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface StyleCardProps {
  style: VideoStyle;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  showEditButton?: boolean;
  isEdited?: boolean;
}

function StyleCard({
  style,
  isSelected,
  onSelect,
  onEdit,
  showEditButton = true,
  isEdited = false,
}: StyleCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative h-auto min-h-[120px] p-4 rounded-lg border-2 text-left transition-all
        ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        ${isEdited ? 'ring-2 ring-amber-400 ring-offset-2' : ''}
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-8">
          <Check className="h-5 w-5 text-primary" />
        </div>
      )}
      {isEdited && (
        <div className="absolute top-1 right-1">
          <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
            Editado
          </span>
        </div>
      )}
      <h3 className="font-semibold mb-2 pr-8">{style.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-3">{style.description}</p>
      {showEditButton && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-2 right-2 h-auto p-1"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </button>
  );
}
