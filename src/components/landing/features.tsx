import { Check, Code, Play, MessageSquare, History, Download, SquarePen, WandSparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-purple-600" />,
      title: "Intuitive Chat Interface",
      description: "Describe the mathematical concept you want to visualize in plain English."
    },
    {
      icon: <WandSparkles className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Generation",
      description: "Our AI transforms your prompts into professional Manim code for stunning animations."
    },
    {
      icon: <Code className="h-8 w-8 text-green-600" />,
      title: "Code Review",
      description: "View and approve the generated code before creating your video."
    },
    {
      icon: <SquarePen className="h-8 w-8 text-yellow-600" />,
      title: "Customization Options",
      description: "Fine-tune the generated code to match your exact requirements."
    },
    {
      icon: <Play className="h-8 w-8 text-red-600" />,
      title: "Instant Playback",
      description: "Watch your mathematical concepts come to life in high-quality video."
    },
    {
      icon: <History className="h-8 w-8 text-indigo-600" />,
      title: "Generation History",
      description: "Access all your past creations with full video and code history."
    },
    {
      icon: <Download className="h-8 w-8 text-orange-600" />,
      title: "Easy Downloads",
      description: "Download videos for use in presentations, lectures, or educational content."
    },
    {
      icon: <Check className="h-8 w-8 text-teal-600" />,
      title: "Mathematically Accurate",
      description: "Ensure your visualizations are precise and academically sound."
    }
  ];

  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            All the tools you need to visualize math
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our platform combines AI with Manim to create beautiful mathematical animations with minimal effort.
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:shadow-md">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}