'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { verifyTransporterCredibility, VerifyTransporterCredibilityOutput } from '@/ai/flows/verify-transporter-credibility';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';

const formSchema = z.object({
  profileDetails: z.string().min(50, 'Please provide more details.'),
  transportHistory: z.string().min(50, 'Please provide more history.'),
});

export function CredibilityCheck() {
  const [result, setResult] = useState<VerifyTransporterCredibilityOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileDetails: "Experienced driver with 10+ years in long-haul trucking. Specializes in fragile goods. Certified for hazardous materials. Consistent 5-star reviews from clients for reliability and communication.",
      transportHistory: "Completed over 500 deliveries in the last 2 years. 98% on-time delivery rate. No reported accidents or cargo damage. Handles routes across North America. Frequently transports electronics and medical supplies.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const aiResult = await verifyTransporterCredibility(values);
      setResult(aiResult);
    } catch (error) {
      console.error(error);
      setResult({ isCredible: false, reason: "An error occurred during verification. Please try again." });
    }
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Transporter Credibility Check</CardTitle>
        <CardDescription>Use our AI-powered tool to verify the credibility of a transporter based on their profile and history.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="profileDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Details</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter transporter's profile details..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transportHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transport History</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter transporter's transport history..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Credibility
            </Button>
          </CardFooter>
        </form>
      </Form>
      {result && (
        <CardContent>
          <Alert variant={result.isCredible ? "default" : "destructive"} className="mt-4">
            {result.isCredible ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
            <AlertTitle className="font-headline">{result.isCredible ? "Credible Transporter" : "Credibility Warning"}</AlertTitle>
            <AlertDescription>{result.reason}</AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
}
