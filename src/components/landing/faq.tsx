import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "What is Motion?",
      answer: "Motion is a platform that uses AI to convert mathematical concepts into beautiful, animated videos using Manim, a powerful mathematical animation library. You simply describe what you want to visualize, and our system generates both the code and the final video."
    },
    {
      question: "Do I need to know how to code?",
      answer: "No coding knowledge is required! While you'll be able to review and approve the generated Manim code, you don't need to understand it or modify it yourself. Our AI handles all the technical details for you."
    },
    {
      question: "What types of math can I visualize?",
      answer: "Motion can handle a wide range of mathematical concepts, including calculus, linear algebra, geometry, statistics, number theory, and more. If it can be described mathematically, our system can likely create a visualization for it."
    },
    {
      question: "How long does it take to generate a video?",
      answer: "The time varies based on the complexity of your request and current server load. Simple animations might be ready in under a minute, while more complex visualizations could take a few minutes. You'll be able to track the progress in real-time."
    },
    {
      question: "Can I customize the generated videos?",
      answer: "Yes! You can review the generated code before it's rendered and request modifications. You can specify colors, animation styles, duration, and other aspects in your initial prompt or after reviewing the code."
    },
    {
      question: "How can I use the videos I create?",
      answer: "Videos you create on Motion can be downloaded and used for educational purposes, presentations, online courses, research papers, or any other context where mathematical visualization would be helpful."
    },
    {
      question: "Is there a limit to how many videos I can create?",
      answer: "Yes, we have daily limits to ensure fair usage for all users. Free accounts can use up to 250,000 tokens per day for AI interactions and create up to 5 videos per day. These limits reset daily at midnight UTC. Premium plans offer higher limits or unlimited usage."
    }
  ];

  return (
    <section id="faq" className="py-20 sm:py-32 sm:h-screen bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions about Motion.
          </p>
        </div>
        
        <div className="mt-16 mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}