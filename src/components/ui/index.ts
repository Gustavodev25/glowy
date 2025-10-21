// Componentes de Input Padronizados
export { default as Input } from './Input';
export { default as TextArea } from './TextArea';
export { default as Select } from './Select';

// Componentes Estilizados
export { StyledInput } from './StyledInput';
export { StyledTextarea } from './StyledTextarea';
export { StyledSelect } from './StyledSelect';
export { StyledButton } from './StyledButton';

// Componentes de Feedback
export { default as Loader } from './Loader';

// Tipos
export type { InputProps } from './Input';
export type { TextAreaProps } from './TextArea';
export type { SelectProps, SelectOption } from './Select';
export type { SwitchProps } from './Switch';

export type StyledInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  containerClassName?: string;
};

export type StyledTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  maxLength?: number;
  className?: string;
  containerClassName?: string;
};

export type StyledSelectOption = {
  value: string;
  label: string;
};

export type StyledSelectProps = {
  label: string;
  options: StyledSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
};

export type StyledButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
};
