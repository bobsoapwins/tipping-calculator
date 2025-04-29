
'use client';

import {useState, useEffect} from 'react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Users, PiggyBank, CheckCircle} from 'lucide-react';
import {Separator} from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Badge} from '@/components/ui/badge';
import {cn} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast';
import {Progress} from '@/components/ui/progress';
import { Toaster } from '@/components/ui/toaster';

const ResultRow = ({
  label,
  value,
  icon,
  isError,
}: {
  label: string;
  value: string | React.ReactNode; // Allow ReactNode for Invalid span
  icon: React.ReactNode;
  isError?: boolean;
}) => (
  <div className="grid grid-cols-[1fr_auto] items-center gap-2 py-1">
    <div className="flex items-center gap-2">
      {icon}
      <Label className={cn("text-sm", {'text-red-500': isError})}>
        {label}
      </Label>
    </div>
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className={cn({'bg-red-100 text-red-500 border-red-500': isError})}
      >
        {value}
      </Badge>
    </div>
  </div>
);

const formSchema = z.object({
  billAmount: z.number().min(0, {message: 'Amount must be at least 0'}).optional(),
  tipPercentage: z.number().min(0, {message: 'Percentage must be at least 0'}).optional(), // Removed max(100)
  numberOfPeople: z
    .number()
    .min(1, {message: 'Number of people must be at least 1.'})
    .optional(),
});

const LoadingScreen = ({progress}: {progress: number}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // Wait for a bit after reaching 100%

      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {loading ? (
        <>
          <Progress value={progress} className="w-64 h-4" /> {/* Increased height */}
          <p className="mt-4 text-lg font-semibold">Loading... {progress}%</p>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <CheckCircle className="text-primary h-32 w-32" />
          <p className="mt-4 text-lg font-semibold">Done!</p>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [billAmount, setBillAmount] = useState<number | null>(null);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [numberOfPeople, setNumberOfPeople] = useState<number | null>(1);
  const [isLoading, setIsLoading] = useState(true);
  const {toast} = useToast();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isLoading) {
      if (progress < 100) {
        interval = setInterval(() => {
          setProgress(prevProgress => {
            const randomIncrement = Math.floor(Math.random() * 15) + 5; // Random increment between 5 and 20
            const newProgress = Math.min(prevProgress + randomIncrement, 100);
            return newProgress;
          });
        }, 100);
      } else if (progress === 100) {
        // Ensures loading state changes after progress reaches 100% and LoadingScreen handles the delay
        const loadingTimer = setTimeout(() => setIsLoading(false), 600); // Ensure this delay > LoadingScreen delay
         return () => clearTimeout(loadingTimer);
      }
    } else {
       if (interval) clearInterval(interval);
    }


    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, progress]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billAmount: null,
      tipPercentage: 0,
      numberOfPeople: 1,
    },
  });

  const calculateTip = () => {
    const currentNumPeople = numberOfPeople === null ? 0 : numberOfPeople; // Treat null as 0 for calculation logic

    if (!billAmount || billAmount < 0)
      return {
        tipAmount: 0,
        totalBill: 0,
        amountPerPerson: currentNumPeople <= 0 ? 'Invalid' : '0.00',
      };

    const tipAmount = billAmount * (tipPercentage / 100);
    const totalBill = billAmount + tipAmount;
    const amountPerPerson =
      currentNumPeople <= 0
        ? 'Invalid'
        : (totalBill / currentNumPeople).toFixed(2);

    return {
      tipAmount,
      totalBill,
      amountPerPerson,
    };
  };

  const {tipAmount, totalBill, amountPerPerson} = calculateTip();

  useEffect(() => {
    const currentNumPeople = numberOfPeople === null ? 0 : numberOfPeople;
    if (currentNumPeople !== null && currentNumPeople <= 0) {
      toast({
        variant: 'destructive',
        title: 'Input Invalid',
        description: 'Number of people cannot be zero or less.',
      });
    }
  }, [numberOfPeople, toast]);

  if (isLoading) {
    return <LoadingScreen progress={progress} />;
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-in fade-in duration-700">
      <Toaster />
      <Card className="w-full max-w-md space-y-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="space-y-1">
           <CardTitle className={cn("text-2xl font-semibold text-center transition-colors duration-700", isLoading ? "text-gray-400" : "text-foreground")}>
             Tip Smarter, Not Harder
          </CardTitle>
          <CardDescription className="text-center">
            A simple tipping calculator by North Dunne
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <div className="grid gap-2">
              <Label htmlFor="billAmount">Amount To Be Paid</Label>
              <Input
                type="number"
                id="billAmount"
                placeholder="Enter bill amount"
                min="0"
                value={billAmount === null ? '' : billAmount}
                onChange={e => setBillAmount(e.target.value === '' ? null : parseFloat(e.target.value))}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipPercentage">Tip Percentage</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  id="tipPercentage"
                  min="0"
                  max="100"
                  step="1"
                  value={tipPercentage.toString()} // Ensure value is string
                  className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer accent-accent transition-all duration-300"
                  onChange={e => setTipPercentage(parseInt(e.target.value))}
                />
                <Input
                  type="number"
                  id="tipPercentage-number"
                  min="0"
                  // Removed max="100"
                  value={tipPercentage}
                  className="w-20 transition-all duration-300 focus:ring-2 focus:ring-primary"
                  onChange={e => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                    // Clamp value to be at least 0
                    const clampedVal = Math.max(0, isNaN(val) ? 0 : val);
                    setTipPercentage(clampedVal);
                  }}
                />
                <span>%</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="numberOfPeople"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Number of People</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter number of people"
                      min="1" // Keep min for native validation, but handle 0 via state/style
                      className={cn(
                        'transition-all duration-300 focus:ring-2 focus:ring-primary',
                        (field.value !== null && field.value <= 0) ? 'border-red-700 text-red-700' : '' // Apply red border and text if <= 0
                      )}
                      {...field}
                       value={field.value === null ? '' : field.value} // Handle null value for input
                       onChange={e => {
                        const rawValue = e.target.value;
                        if (rawValue === '') {
                           field.onChange(null); // Pass null up
                           setNumberOfPeople(null);
                        } else {
                           const value = parseInt(rawValue);
                           if (!isNaN(value)) {
                             field.onChange(value); // Pass the number up
                             setNumberOfPeople(value);
                           }
                         }
                      }}

                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>

          <Separator />

           <div className="grid gap-4">
            <ResultRow
              label="Tip Amount"
              value={`$${tipAmount.toFixed(2)}`}
              icon={<PiggyBank className="w-4 h-4" />}
              isError={amountPerPerson === 'Invalid'} // Error if amountPerPerson is Invalid
            />
            <ResultRow
              label="Total Bill"
              value={`$${totalBill.toFixed(2)}`}
              icon={<PiggyBank className="w-4 h-4" />}
              isError={amountPerPerson === 'Invalid'} // Error if amountPerPerson is Invalid
            />
            <ResultRow
              label="Amount Per Person"
              value={
                amountPerPerson === 'Invalid' ? (
                  <span className="text-red-500">Invalid</span>
                ) : (
                  `$${amountPerPerson}`
                )
              }
              icon={
                <Users
                  className={cn('w-4 h-4', {
                    'text-red-500': amountPerPerson === 'Invalid',
                  })}
                />
              }
              isError={amountPerPerson === 'Invalid'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
