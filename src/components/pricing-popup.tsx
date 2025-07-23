"use client";

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner"

const pricingPlans = {
  free: {
    name: 'Free',
    price: '$0',
    annualPrice: undefined,
    period: '',
    annualText: undefined,
    description: 'Perfect for students and educators getting started.',
    features: [
      '3 video generations per day',
      '150,000 AI tokens daily',
      'Basic video quality (720p)',
      'Chat interface for prompts',
      'Video library access',
      'Standard processing time',
    ],
    buttonText: 'Your Current Plan',
    popular: false,
  },
  pro: {
    name: 'Pro',
    price: '$9.00',
    annualPrice: '$16.67',
    period: '/ month',
    annualText: 'when billed annually',
    description: 'Ideal for educators, content creators, and professionals.',
    features: [
      '50 video generations per day',
      'Unlimited AI conversations',
      'High-quality videos (1080p)',
      'Priority video processing',
      'Advanced Manim features',
      'Code review & editing',
      'Download videos (MP4)',
      'Email support'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
  },
  max: {
    name: 'Max',
    price: '$39.00',
    annualPrice: undefined,
    period: '/ month',
    annualText: undefined,
    description: 'Enterprise solution for institutions and research teams.',
    features: [
      'Everything in Pro',
      '4K video rendering',
      'Custom video export formats',
      'Bulk video generation',
      'Advanced code customization',
      'Team collaboration features',
      'Priority customer support',
      'Custom integrations API',
      'Dedicated account manager',
    ],
    buttonText: 'Contact Sales',
    popular: false,
  },
};

interface PricingPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingPopup({ open, onOpenChange }: PricingPopupProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-foreground">
            Upgrade to unlock the full potential
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(pricingPlans).map(([key, plan]) => (
              <div
                key={key}
                className={`relative p-6 rounded-xl border transition-all duration-200 hover:border-muted-foreground ${plan.popular
                  ? 'border-primary bg-accent'
                  : 'border-border bg-card'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-4">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.annualPrice && (
                    <p className="text-sm text-muted-foreground">
                      {plan.annualPrice} {plan.annualText}
                    </p>
                  )}
                  <p className="text-sm mt-2 text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full font-medium ${plan.name === "Free" ? "cursor-not-allowed" : ""
                    }`}
                  variant={plan.popular ? "default" : "secondary"}
                  onClick={() => {
                    if (plan.name !== "Free") {
                      onOpenChange(false);
                      toast.info("Plan coming soon. Stay tuned.");
                    }
                  }}
                >
                  {plan.buttonText}
                </Button>

              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
