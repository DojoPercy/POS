'use client';

import { Badge } from '@/components/ui/badge';

interface IngredientItem {
  id: string;
  menuId: string;
  ingredientId: string;
  amount: number;
  ingredient?: {
    name: string;
  };
}

interface IngredientDisplayProps {
  ingredients: (IngredientItem | string)[];
  maxDisplay?: number;
  className?: string;
}

export default function IngredientDisplay({
  ingredients,
  maxDisplay = 3,
  className = '',
}: IngredientDisplayProps) {
  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  const getIngredientName = (
    ingredient: IngredientItem | string,
    index: number
  ): string => {
    console.log('getIngredientName', ingredient, index);

    if (typeof ingredient === 'string') {
      return ingredient;
    }

    if (ingredient && typeof ingredient === 'object') {
      if (
        ingredient.ingredient &&
        typeof ingredient.ingredient.name === 'string'
      ) {
        return ingredient.ingredient.name;
      }
    }

    return `Ingredient ${index + 1}`;
  };

  const displayIngredients = ingredients.slice(0, maxDisplay);
  const remainingCount = ingredients.length - maxDisplay;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayIngredients.map((ingredient, index) => {
        const name = getIngredientName(ingredient, index);
        console.log('Rendering badge for:', name);
        return (
          <Badge
            key={
              typeof ingredient === 'string'
                ? ingredient
                : (ingredient.id ?? index)
            }
            variant='secondary'
            className='text-xs'
          >
            {name}
          </Badge>
        );
      })}

      {remainingCount > 0 && (
        <Badge variant='secondary' className='text-xs'>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
