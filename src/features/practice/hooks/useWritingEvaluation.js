import { useState } from 'react';

export function useWritingEvaluation() {
    const [evaluation, setEvaluation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const evaluate = async ({ task_type, user_text, topic, reference, context }) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/practice/evaluate-writing`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task_type,
                    user_text,
                    topic,
                    reference,
                    context
                }),
            });

            if (!response.ok) throw new Error("Failed to evaluate writing");
            const result = await response.json();
            setEvaluation(result);
            return result;
        } catch (error) {
            console.error("Writing evaluation error:", error);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetEvaluation = () => {
        setEvaluation(null);
    };

    return { evaluation, isSubmitting, evaluate, resetEvaluation };
}
