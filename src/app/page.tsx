'use client';

import {useState, Suspense} from 'react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Users, PiggyBank} from 'lucide-react';
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

const ResultRow = ({
  label,
  value,
  icon,
  isError,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  isError?: boolean;
}) => (
  <div className="grid grid-cols-[1fr_auto] items-center gap-2 py-1">
    <div className="flex items-center gap-2">
      {icon}
      <Label className={`text-sm ${isError ? 'text-red-500' : ''}`}>
        {label}
      </Label>
    </div>
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className={isError ? 'bg-red-100 text-red-500 border-red-500' : ''}
      >
        {value}
      </Badge>
    </div>
  </div>
);

const formSchema = z.object({
  billAmount: z.number().optional(),
  tipPercentage: z.number().optional(),
  numberOfPeople: z
    .number()
    .min(1, {message: 'Number of people must be at least 1.'})
    .optional(),
});

export default function Home() {
  const [billAmount, setBillAmount] = useState<number | null>(null);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billAmount: null,
      tipPercentage: 0,
      numberOfPeople: 1,
    },
  });

  const calculateTip = () => {
    if (!billAmount)
      return {
        tipAmount: 0,
        totalBill: 0,
        amountPerPerson: '0.00', // Ensure amountPerPerson is a string
      };

    const tipAmount = billAmount * (tipPercentage / 100);
    const totalBill = billAmount + tipAmount;
    const amountPerPerson =
      numberOfPeople === 0 || numberOfPeople === null
        ? 'Invalid'
        : (totalBill / numberOfPeople).toFixed(2);

    return {
      tipAmount,
      totalBill,
      amountPerPerson,
    };
  };

  const {tipAmount, totalBill, amountPerPerson} = calculateTip();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md space-y-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center">
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
                value={billAmount === null ? '' : billAmount}
                onChange={e => setBillAmount(parseFloat(e.target.value))}
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
                  value={tipPercentage}
                  className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer accent-accent transition-all duration-300"
                  onChange={e => setTipPercentage(parseInt(e.target.value))}
                />
                <Input
                  type="number"
                  id="tipPercentage-number"
                  value={tipPercentage}
                  className="w-20 transition-all duration-300 focus:ring-2 focus:ring-primary"
                  onChange={e => setTipPercentage(parseInt(e.target.value))}
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
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                      {...field}
                      onChange={e => {
                        field.onChange(parseInt(e.target.value));
                        setNumberOfPeople(parseInt(e.target.value));
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
            />
            <ResultRow
              label="Total Bill"
              value={`$${totalBill.toFixed(2)}`}
              icon={<PiggyBank className="w-4 h-4" />}
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
