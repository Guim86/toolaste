import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Step {
  label: string;
  content: ReactNode;
}

interface Props {
  steps: Step[];
}

export function MobileStepper({ steps }: Props) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between shrink-0">
        <span className="text-xs text-muted-foreground font-medium">
          {current + 1} / {steps.length}
        </span>
        <span className="text-sm font-medium truncate ml-2">
          {steps[current].label}
        </span>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 pb-20">
          {steps[current].content}
        </div>
      </ScrollArea>

      {/* Navigation buttons — fixed al fondo del viewport */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-card px-4 py-2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={current === 0}
          onClick={() => setCurrent(c => c - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Indietro
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={current === steps.length - 1}
          onClick={() => setCurrent(c => c + 1)}
        >
          Avanti
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
