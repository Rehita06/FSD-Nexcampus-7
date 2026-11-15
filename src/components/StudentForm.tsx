import { useState, type FormEvent } from 'react';
import { ApiError, errorMessage } from '@/services/http';
import type { Student, StudentDraft } from '@/types';

interface StudentFormProps {
  initial?: Student;
  departmentSuggestions: string[];
  onSubmit: (draft: StudentDraft) => Promise<void>;
  onCancel: () => void;
}

type Fields = { name: string; registerNumber: string; course: string; semester: string; department: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

const SEMESTERS = Array.from({ length: 12 }, (_, i) => i + 1);

function validate(values: Fields): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter the student name (at least 2 characters).';
  if (!values.registerNumber.trim()) errors.registerNumber = 'Enter the register number.';
  if (!values.course.trim()) errors.course = 'Enter the course.';
  if (!values.semester) errors.semester = 'Select the semester.';
  if (!values.department.trim()) errors.department = 'Enter the department.';
  return errors;
}

export default function StudentForm({ initial, departmentSuggestions, onSubmit, onCancel }: StudentFormProps) {
  const [values, setValues] = useState<Fields>({
    name: initial?.name ?? '',
    registerNumber: initial?.registerNumber ?? '',
    course: initial?.course ?? '',
    semester: initial ? String(initial.semester) : '',
    department: initial?.department ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof Fields, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        registerNumber: values.registerNumber.trim(),
        course: values.course.trim(),
        semester: Number(values.semester),
        department: values.department.trim(),
      });
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.fieldErrors).length > 0) {
        setErrors(e.fieldErrors as FieldErrors);
        setFormError(e.status === 409 ? e.message : 'Please correct the highlighted fields.');
      } else {
        setFormError(errorMessage(e));
      }
      setSubmitting(false);
    }
  };

  const fieldClass = (key: keyof Fields) => `input ${errors[key] ? '!border-rose-400' : ''}`;
  const describe = (key: keyof Fields) => (errors[key] ? `student-${key}-error` : undefined);
  const FieldError = ({ name }: { name: keyof Fields }) =>
    errors[name] ? (
      <p id={`student-${name}-error`} className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">{errors[name]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="student-name" className="label">Student name</label>
        <input
          id="student-name"
          className={fieldClass('name')}
          placeholder="e.g. Asha Menon"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          maxLength={100}
          autoComplete="off"
          aria-invalid={!!errors.name}
          aria-describedby={describe('name')}
        />
        <FieldError name="name" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="student-registerNumber" className="label">Register number</label>
          <input
            id="student-registerNumber"
            className={fieldClass('registerNumber')}
            placeholder="e.g. 2648543"
            value={values.registerNumber}
            onChange={(e) => update('registerNumber', e.target.value)}
            maxLength={30}
            autoComplete="off"
            aria-invalid={!!errors.registerNumber}
            aria-describedby={describe('registerNumber')}
          />
          <FieldError name="registerNumber" />
        </div>
        <div>
          <label htmlFor="student-semester" className="label">Semester</label>
          <select
            id="student-semester"
            className={fieldClass('semester')}
            value={values.semester}
            onChange={(e) => update('semester', e.target.value)}
            aria-invalid={!!errors.semester}
            aria-describedby={describe('semester')}
          >
            <option value="">Select semester</option>
            {SEMESTERS.map((n) => (
              <option key={n} value={n}>Semester {n}</option>
            ))}
          </select>
          <FieldError name="semester" />
        </div>
      </div>

      <div>
        <label htmlFor="student-course" className="label">Course</label>
        <input
          id="student-course"
          className={fieldClass('course')}
          placeholder="e.g. MSc Artificial Intelligence and Machine Learning"
          value={values.course}
          onChange={(e) => update('course', e.target.value)}
          maxLength={100}
          autoComplete="off"
          aria-invalid={!!errors.course}
          aria-describedby={describe('course')}
        />
        <FieldError name="course" />
      </div>

      <div>
        <label htmlFor="student-department" className="label">Department</label>
        <input
          id="student-department"
          className={fieldClass('department')}
          placeholder="e.g. Computer Science"
          list="student-department-options"
          value={values.department}
          onChange={(e) => update('department', e.target.value)}
          maxLength={100}
          autoComplete="off"
          aria-invalid={!!errors.department}
          aria-describedby={describe('department')}
        />
        <datalist id="student-department-options">
          {departmentSuggestions.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
        <FieldError name="department" />
      </div>

      {formError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{formError}</p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={submitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Register student'}
        </button>
      </div>
    </form>
  );
}
