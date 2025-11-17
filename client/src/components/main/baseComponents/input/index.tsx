import './index.css';

/**
 * Interface representing the props for the Input component.
 *
 * - title - The label to display
 * - hint - An optional hint or description displayed below the title.
 * - id - The unique identifier for the input field.
 * - mandatory - Indicates whether the input field is required. Defaults to true.
 * - val - The current value of the input field.
 * - setState - Callback function to update the state with the input field's value.
 * - err - An optional error message to display if there is an error with the input.
 * - type - The input type (text, email, password, etc.). Defaults to 'text'.
 * - placeholder - Optional placeholder text for the input field.
 */
interface InputProps {
  title: string;
  hint?: string;
  id: string;
  mandatory?: boolean;
  val: string;
  setState: (value: string) => void;
  err?: string;
  type?: string;
  placeholder?: string;
}

/**
 * Input component that renders a labeled text input field with optional hint and error message.
 * It also displays an asterisk if the field is mandatory.
 *
 * @param title The label for the input field.
 * @param hint Optional hint or description for the input field.
 * @param id The unique identifier for the input field.
 * @param mandatory Indicates if the input field is required. Defaults to true.
 * @param val The current value of the input field.
 * @param setState Callback function to update the value of the input field.
 * @param err Optional error message to display below the input field.
 * @param type The input type. Defaults to 'text'.
 * @param placeholder Optional placeholder text for the input field.
 */
const Input = ({
  title,
  hint,
  id,
  mandatory = true,
  val,
  setState,
  err,
  type = 'text',
  placeholder,
}: InputProps) => (
  <div className='form-group'>
    <label htmlFor={id} className={`form-label ${mandatory ? 'required' : ''}`}>
      {title}
    </label>
    {hint && <div className='form-help'>{hint}</div>}
    <input
      id={id}
      className={`form-input ${err ? 'form-input-error' : ''}`}
      type={type}
      value={val}
      onChange={e => setState(e.target.value)}
      placeholder={placeholder}
      required={mandatory}
      aria-describedby={hint ? `${id}-hint` : undefined}
      aria-invalid={err ? 'true' : 'false'}
    />
    {hint && (
      <div id={`${id}-hint`} className='form-help'>
        {hint}
      </div>
    )}
    {err && (
      <div className='form-error' role='alert' aria-live='polite'>
        {err}
      </div>
    )}
  </div>
);

export default Input;
