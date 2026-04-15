'use client';

import { useState } from 'react';
import { useVideoStore } from '@/hooks/useVideoStore';
import { VideoStyle, VIDEO_STYLES, SCENE_COUNTS, CHARACTER_LIMITS } from '@/types/constants';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil, Plus, Check } from 'lucide-react';

export function StyleSection() {
  const {
    selectedStyle,
    customStyles,
    setSelectedStyle,
    addCustomStyle,
  } = useVideoStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<VideoStyle | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const allStyles = [...VIDEO_STYLES, ...customStyles];

  const handleEditStyle = (style: VideoStyle) => {
    setEditingStyle(style);
    setCustomTitle(style.title);
    setCustomDescription(style.description);
    setIsDialogOpen(true);
  };

  const handleSaveCustomStyle = () => {
    if (!customTitle.trim() || !customDescription.trim()) return;

    const newStyle: VideoStyle = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      description: customDescription.trim(),
      isCustom: true,
    };

    addCustomStyle(newStyle);
    setIsDialogOpen(false);
    setCustomTitle('');
    setCustomDescription('');
    setEditingStyle(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Estilo de Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allStyles.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              isSelected={selectedStyle?.id === style.id}
              onSelect={() => setSelectedStyle(style)}
              onEdit={() => handleEditStyle(style)}
            />
          ))}

          {/* Add Custom Style Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-auto min-h-[120px] flex flex-col items-center justify-center gap-2 border-dashed"
              >
                <Plus className="h-6 w-6" />
                <span>Agregar Estilo</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Estilo Personalizado</DialogTitle>
                <DialogDescription>
                  Crea un estilo con tu propia descripción de prompt.
                  Sé conciso (máximo {CHARACTER_LIMITS.CUSTOM_STYLE_DESCRIPTION} caracteres).
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
                  <Label htmlFor="style-description">
                    Descripción del Prompt
                  </Label>
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveCustomStyle}
                  disabled={!customTitle.trim() || !customDescription.trim()}
                >
                  Guardar Estilo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

interface StyleCardProps {
  style: VideoStyle;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

function StyleCard({ style, isSelected, onSelect, onEdit }: StyleCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative h-auto min-h-[120px] p-4 rounded-lg border-2 text-left transition-all
        ${
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Check className="h-5 w-5 text-primary" />
        </div>
      )}
      <h3 className="font-semibold mb-2 pr-6">{style.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-3">
        {style.description}
      </p>
      {style.isCustom && (
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
