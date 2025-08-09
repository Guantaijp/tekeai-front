// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Verifies the credibility of a transporter using AI.
 *
 * - verifyTransporterCredibility - A function that verifies transporter credibility.
 * - VerifyTransporterCredibilityInput - The input type for the verifyTransporterCredibility function.
 * - VerifyTransporterCredibilityOutput - The return type for the verifyTransporterCredibility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyTransporterCredibilityInputSchema = z.object({
  profileDetails: z
    .string()
    .describe('Details about the transporter profile, including experience, reviews, and certifications.'),
  transportHistory: z
    .string()
    .describe('A summary of the transporters transport history.'),
});
export type VerifyTransporterCredibilityInput = z.infer<
  typeof VerifyTransporterCredibilityInputSchema
>;

const VerifyTransporterCredibilityOutputSchema = z.object({
  isCredible: z
    .boolean()
    .describe('Whether the transporter is credible or not based on the provided information.'),
  reason: z
    .string()
    .describe('The detailed reasons and justification for the credibility assessment.'),
});
export type VerifyTransporterCredibilityOutput = z.infer<
  typeof VerifyTransporterCredibilityOutputSchema
>;

export async function verifyTransporterCredibility(
  input: VerifyTransporterCredibilityInput
): Promise<VerifyTransporterCredibilityOutput> {
  return verifyTransporterCredibilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyTransporterCredibilityPrompt',
  input: {schema: VerifyTransporterCredibilityInputSchema},
  output: {schema: VerifyTransporterCredibilityOutputSchema},
  prompt: `You are an AI expert specializing in assessing the credibility of transporters.

You will use the profile details and transport history provided to determine if a transporter is credible.
You will provide a boolean value for isCredible and a detailed reason for your assessment.

Profile Details: {{{profileDetails}}}
Transport History: {{{transportHistory}}}`,
});

const verifyTransporterCredibilityFlow = ai.defineFlow(
  {
    name: 'verifyTransporterCredibilityFlow',
    inputSchema: VerifyTransporterCredibilityInputSchema,
    outputSchema: VerifyTransporterCredibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
