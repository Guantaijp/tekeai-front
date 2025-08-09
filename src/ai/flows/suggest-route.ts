// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Suggests the shortest and most efficient route between two locations.
 *
 * - suggestRoute - A function that suggests a route.
 * - SuggestRouteInput - The input type for the suggestRoute function.
 * - SuggestRouteOutput - The return type for the suggestRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRouteInputSchema = z.object({
  origin: z.string().describe('The starting point of the route.'),
  destination: z.string().describe('The end point of the route.'),
});
export type SuggestRouteInput = z.infer<typeof SuggestRouteInputSchema>;

const SuggestRouteOutputSchema = z.object({
  route: z
    .string()
    .describe('A detailed, turn-by-turn description of the suggested route.'),
  distance: z.string().describe('The total estimated distance of the route.'),
});
export type SuggestRouteOutput = z.infer<typeof SuggestRouteOutputSchema>;

export async function suggestRoute(
  input: SuggestRouteInput
): Promise<SuggestRouteOutput> {
  return suggestRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRoutePrompt',
  input: {schema: SuggestRouteInputSchema},
  output: {schema: SuggestRouteOutputSchema},
  prompt: `You are a logistics expert specializing in route optimization for truck drivers.

Given an origin and a destination, provide the shortest and most efficient route for a commercial truck.
Provide a summary of the route and the estimated total distance.

Origin: {{{origin}}}
Destination: {{{destination}}}`,
});

const suggestRouteFlow = ai.defineFlow(
  {
    name: 'suggestRouteFlow',
    inputSchema: SuggestRouteInputSchema,
    outputSchema: SuggestRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
