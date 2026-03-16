import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function CarouselSection({
  title,
  description,
  children,
  action,
  className = "",
}) {
  return (
    <section
      className={`rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Side: Text Content */}
        <div className="flex flex-col justify-center lg:w-1/3 space-y-4">
          <h2 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
          {action && <div className="pt-4">{action}</div>}
        </div>

        {/* Right Side: Carousel */}
        <div className="relative flex-1 min-w-0">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <div className="relative px-12 md:px-14">
              <CarouselPrevious
                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10"
                variant="outline"
              />

              <CarouselContent className="-ml-4">
                {React.Children.map(children, (child) => (
                  <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/3">
                    <div className="h-full pr-1 pb-1">{child}</div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselNext
                className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10"
                variant="outline"
              />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
