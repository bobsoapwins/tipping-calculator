
'use client';

import {useState, useEffect, Suspense} from 'react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, PiggyBank, CheckCircle } from 'lucide-react';
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
import {useToast}from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import {Progress} from '@/components/ui/progress';
import { Toaster } from '@/components/ui/toaster';

const ResultRow = ({
  label,
  value,
  icon,
  isError,
}: {
  label: string;
  value: string | React.ReactNode; 
  icon: React.ReactNode;
  isError?: boolean;
}) => (
  <div className="grid grid-cols-[1fr_auto] items-center gap-2 py-1">
    <div className="flex items-center gap-2">
      {icon}
      <Label className={cn("text-sm", {'text-destructive': isError && label !== "Tip Amount" && label !== "Total Bill"})}>
        {label}
      </Label>
    </div>
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className={cn({'bg-destructive/20 text-destructive border-destructive': isError})}
      >
        {value}
      </Badge>
    </div>
  </div>
);

const formSchema = z.object({
  billAmount: z.number().min(0, {message: 'Amount must be at least 0'}).optional(),
  tipPercentage: z.number().min(0, {message: 'Percentage must be at least 0'}).optional(),
  numberOfPeople: z
    .number()
    .min(1, {message: 'Number of people must be at least 1.'})
    .optional(),
});

const LoadingScreen = ({progress}: {progress: number}) => {
  const [loadingText, setLoadingText] = useState("Loading...");

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setLoadingText("Done!");
      }, 500); 

      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
       {progress < 100 ? (
        <>
          <Progress value={progress} className="w-64 h-4 rounded-full shadow-inner border border-border" />
          <p className="mt-4 text-lg font-semibold text-foreground">{loadingText} {progress}%</p>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <CheckCircle className="text-primary h-32 w-32 animate-pulse" />
          <p className="mt-4 text-lg font-semibold text-foreground">{loadingText}</p>
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
  const searchParams = useSearchParams(); 
  const [progress, setProgress] = useState(0);

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '56a79f22';

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isLoading) {
      if (progress < 100) {
        interval = setInterval(() => {
          setProgress(prevProgress => {
            const randomIncrement = Math.floor(Math.random() * 15) + 5; 
            const newProgress = Math.min(prevProgress + randomIncrement, 100);
            return newProgress;
          });
        }, 200); 
      } else if (progress === 100) {
        
        const loadingTimer = setTimeout(() => setIsLoading(false), 700); 
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

 useEffect(() => {
    // Removed toast logic as form validation messages handle this
  }, [numberOfPeople, toast]);

  const calculateTip = () => {
    const currentBillAmount = billAmount === null || isNaN(Number(billAmount)) || billAmount < 0 ? 0 : billAmount;
    const currentNumPeople = numberOfPeople === null || isNaN(Number(numberOfPeople)) || numberOfPeople <= 0 ? 0 : numberOfPeople;


    if (currentBillAmount < 0)
      return {
        tipAmount: 0,
        totalBill: 0,
        amountPerPerson: currentNumPeople <= 0 ? 'Invalid' : '0.00',
      };

    const tipAmount = currentBillAmount * (tipPercentage / 100);
    const totalBill = currentBillAmount + tipAmount;
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


  if (isLoading) {
    return <LoadingScreen progress={progress} />;
  }


  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 bg-background ${isLoading ? 'opacity-0' : 'animate-in fade-in duration-1000'}`}>
      <Toaster />
      <Card className="w-full max-w-md space-y-4 rounded-lg shadow-lg transition-all duration-500 hover:shadow-xl">
        <CardHeader className="space-y-1">
           <CardTitle className={cn("text-2xl font-semibold text-center transition-colors duration-700", isLoading ? "text-muted-foreground" : "text-foreground")}>
             Tip Smarter, Not Harder
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
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
                className="transition-all duration-300 focus:ring-2 focus:ring-primary hover:shadow-sm"
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
                  value={tipPercentage.toString()} 
                  className="w-full h-2 bg-primary/50 rounded-lg appearance-none cursor-pointer accent-accent transition-all duration-300 hover:bg-primary/70"
                  onChange={e => setTipPercentage(parseInt(e.target.value))}
                />
                <Input
                  type="number"
                  id="tipPercentage-number"
                  min="0"
                  value={tipPercentage}
                  className="w-20 transition-all duration-300 focus:ring-2 focus:ring-primary hover:shadow-sm"
                  onChange={e => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value);
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
                      min="1" 
                      className={cn(
                        'transition-all duration-300 focus:ring-2 focus:ring-primary hover:shadow-sm',
                        (field.value !== null && field.value <= 0) || field.value === null ? 'border-destructive text-destructive placeholder:text-destructive/50' : '' 
                      )}
                      {...field}
                       value={field.value === null ? '' : field.value} 
                       onChange={e => {
                        const rawValue = e.target.value;
                        if (rawValue === '') {
                           field.onChange(null); 
                           setNumberOfPeople(null);
                        } else {
                           const value = parseInt(rawValue);
                           if (!isNaN(value)) {
                             field.onChange(value); 
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
              icon={<PiggyBank className="w-4 h-4 text-foreground" />}
              isError={false} 
            />
            <ResultRow
              label="Total Bill"
              value={`$${totalBill.toFixed(2)}`}
              icon={<PiggyBank className="w-4 h-4 text-foreground" />}
              isError={false} 
            />
            <ResultRow
              label="Amount Per Person"
              value={
                amountPerPerson === 'Invalid' ? (
                  <span className="text-destructive">Invalid</span>
                ) : (
                  `$${amountPerPerson}`
                )
              }
              icon={
                <Users
                  className={cn('w-4 h-4', {
                    'text-destructive': amountPerPerson === 'Invalid',
                    'text-foreground': amountPerPerson !== 'Invalid',
                  })}
                />
              }
              isError={amountPerPerson === 'Invalid'}
            />
          </div>
        </CardContent>
      </Card>
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground">
        Version: {appVersion}
      </div>
    </div>
  );
}
