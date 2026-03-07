export type RegistrationFeedbackModel = {
  title: string;
  description: string;
  toneClassName: string;
};

type RegistrationFeedbackProps = {
  feedback: RegistrationFeedbackModel;
};

export function RegistrationFeedback({ feedback }: RegistrationFeedbackProps) {
  return (
    <section className={`mb-6 rounded-xl border p-4 shadow-sm ${feedback.toneClassName}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wide">{feedback.title}</h2>
      <p className="mt-2 text-sm">{feedback.description}</p>
    </section>
  );
}
