"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, PiggyBank } from "lucide-react";

const ResultRow = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="grid grid-cols-[1fr_auto] items-center gap-2 py-1">
    <div className="flex items-center gap-2">
      {icon}
      <Label className="text-sm">{label}</Label>
    </div>
    <Badge variant="secondary">{value}</Badge>
  </div>
);


export default function Home() {
  const [billAmount, setBillAmount] = useState<number | null>(null);
  const [tipPercentage, setTipPercentage] = useState(15);
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  const calculateTip = () => {
    if (!billAmount) return {
      tipAmount: 0,
      totalBill: 0,
      amountPerPerson: 0
    };

    const tipAmount = billAmount * (tipPercentage / 100);
    const totalBill = billAmount + tipAmount;
    const amountPerPerson = totalBill / numberOfPeople;

    return {
      tipAmount,
      totalBill,
      amountPerPerson
    };
  };

  const { tipAmount, totalBill, amountPerPerson } = calculateTip();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md space-y-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center">TipEase</CardTitle>
          <CardDescription className="text-center">Calculate your tip with ease!</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="billAmount">Bill Amount</Label>
            <Input
              type="number"
              id="billAmount"
              placeholder="Enter bill amount"
              onChange={(e) => setBillAmount(parseFloat(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tipPercentage">Tip Percentage</Label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                id="tipPercentage"
                min="0"
                max="30"
                step="1"
                value={tipPercentage}
                className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer accent-accent"
                onChange={(e) => setTipPercentage(parseInt(e.target.value))}
              />
              <Input
                type="number"
                id="tipPercentage-number"
                value={tipPercentage}
                className="w-20"
                onChange={(e) => setTipPercentage(parseInt(e.target.value))}
              />
              <span>%</span>
            </div>

          </div>

          <div className="grid gap-2">
            <Label htmlFor="numberOfPeople">Number of People</Label>
            <Input
              type="number"
              id="numberOfPeople"
              min="1"
              placeholder="Enter number of people"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
            />
          </div>

          <Separator />

          <div className="grid gap-4">
            <ResultRow label="Tip Amount" value={`$${tipAmount.toFixed(2)}`} icon={<PiggyBank className="w-4 h-4" />} />
            <ResultRow label="Total Bill" value={`$${totalBill.toFixed(2)}`} icon={<PiggyBank className="w-4 h-4" />} />
            <ResultRow label="Amount Per Person" value={`$${amountPerPerson.toFixed(2)}`} icon={<Users className="w-4 h-4" />} />
          </div>
          <Button className="w-full">Calculate</Button>
        </CardContent>
      </Card>
    </div>
  );
}
