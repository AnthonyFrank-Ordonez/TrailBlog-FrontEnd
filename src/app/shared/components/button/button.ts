import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  btnText = input.required<string>();
  btnCustomClass = input<string>();
  btnClick = output<MouseEvent>();
  isDisabled = input<boolean>(false);
  isHidden = input<boolean>(false);
  isLoading = input<boolean>(false);
  btnType = input<'button' | 'submit' | 'reset'>('button');
  size = input<'xs' | 'sm' | 'md' | 'lg' | 'full'>('md');
  variant = input<'primary' | 'secondary' | 'outline'>('primary');
  fontSize = input<'xs' | 'sm' | 'md' | 'lg' | 'base'>('base');
  roundSize = input<'sm' | 'md' | 'lg' | 'full'>('md');

  btnSize: Record<string, string> = {
    xs: 'py-1 px-3',
    sm: 'py-2 px-4',
    md: 'py-3 px-5',
    lg: 'py-3 px-6',
    full: 'w-full py-3',
  };

  btnFontSize: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    base: 'text-base',
  };

  btnVariant: Record<string, string> = {
    primary: 'bg-secondary hover:bg-secondary/80 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-500/80 text-white',
    outline: 'border border-gray-500 bg-transparent text-gray-500 hover:bg-white/5',
  };

  btnRoundSize: Record<string, string> = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  cursorType = computed(() => {
    return this.isDisabled()
      ? 'disabled:cursor-not-allowed disabled:bg-gray-500/20 disabled:text-gray-600'
      : 'cursor-pointer';
  });

  getButtonClass(): string {
    const baseClass =
      'transition-colors duration-300 font-medium focus:outline-none tracking-wider';

    return `${baseClass} ${this.btnSize[this.size()]} ${this.btnVariant[this.variant()]} ${this.btnFontSize[this.fontSize()]} ${this.btnRoundSize[this.roundSize()]} ${this.cursorType()} ${this.btnCustomClass()}`;
  }

  handlebtnClick(event: MouseEvent): void {
    if (!this.isDisabled()) {
      this.btnClick.emit(event);
    }
  }
}
