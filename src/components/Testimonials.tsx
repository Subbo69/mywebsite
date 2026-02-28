import { useRef, useEffect, useState } from 'react';
import { Linkedin, Mail, MessageSquare, X } from 'lucide-react';

export default function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const animationRef = useRef<number>();

  const reviews = [
    {
      name: "@sarah_tech",
      role: "CEO, TechStart",
      link: "https://linkedin.com",
      icon: "linkedin",
      review: "HaloVision transformed our customer service with their AI agents. Response times dropped by 80% and satisfaction is at an all-time high.",
    },
    {
      name: "@mike_growth",
      role: "Founder, GrowthLab",
      link: "https://facebook.com",
      icon: "facebook",
      review: "The automation solutions they built for us freed up our team to focus on strategic work. ROI was evident within the first month.",
    },
    {
      name: "@emma_sales",
      role: "Director, SalesForce",
      link: "https://teams.microsoft.com",
      icon: "teams",
      review: "Their lead generation AI is incredible. We're now capturing and qualifying leads 24/7 without effort. Conversion is way up.",
    },
    {
      name: "@david_cloud",
      role: "Manager, CloudSync",
      link: "https://twitter.com",
      icon: "twitter",
      review: "Working with HaloVision was seamless. They delivered a custom solution that exceeded expectations. Highly responsive team.",
    },
  ];

  const infiniteReviews = [...reviews, ...reviews, ...reviews];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const autoScroll = () => {
      if (!isPaused && container) {
        container.scrollLeft += 0.8;
        const maxScroll = container.scrollWidth / 3;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(autoScroll);
    };

    animationRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused]);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'linkedin': return <Linkedin className="w-2.5 h-2.5" />;
      case 'mail': return <Mail className="w-2.5 h-2.5" />;
      default: return <MessageSquare className="w-2.5 h-2.5" />;
    }
  };

  return (
    <section className="relative py-8 md:py-12 bg-transparent overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-black text-black tracking-tight uppercase">
            What People Say
          </h3>
          <div className="mt-0.5 h-1 w-10 bg-black rounded-full" />
        </div>

        <div className="relative">
          {/* Edge Fades */}
          <div className="absolute left-[-2px] top-[-20px] bottom-[-20px] w-32 z-20 pointer-events-none bg-gradient-to-r from-white to-transparent" />
          <div className="absolute right-[-2px] top-[-20px] bottom-[-20px] w-40 z-20 pointer-events-none bg-gradient-to-l from-white to-transparent" />

          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-6 overflow-x-auto scrollbar-hide py-6 px-4 justify-start relative z-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
          >
            {infiniteReviews.map((review, index) => (
              <div
                key={index}
                onClick={() => setSelectedReview(index % reviews.length)}
                className="
                  flex-shrink-0 w-[245px] md:w-[300px] 
                  bg-white/40 backdrop-blur-md 
                  border border-black 
                  rounded-lg p-4
                  transition-all duration-200 text-left cursor-pointer group
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                  hover:translate-x-[3px] hover:translate-y-[3px]
                "
              >
                <p className="text-black/90 text-[14px] leading-[20px] mb-3 font-bold italic h-[60px] overflow-hidden">
                  "{review.review}"
                </p>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-black border border-black flex-shrink-0" />
                  
                  {/* LINKED SECTION */}
                  <a 
                    href={review.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // Prevents the card click/modal from firing
                    className="flex-1 min-w-0 hover:opacity-60 transition-opacity"
                  >
                    <span className="text-black font-black text-[9px] block truncate uppercase leading-none underline decoration-black/20 decoration-1 underline-offset-2">
                      {review.name}
                    </span>
                    <p className="text-black/50 text-[6.5px] font-bold uppercase tracking-wider leading-none mt-0.5">
                      {review.role}
                    </p>
                  </a>

                  <div className="text-black/20 group-hover:text-black transition-colors">
                    {getIcon(review.icon)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReview !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedReview(null)}>
          <div 
            className="bg-white border border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 max-w-sm w-full relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedReview(null)} className="absolute top-2 right-2 p-1">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full border border-black bg-black" />
              <a 
                href={reviews[selectedReview].link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <h4 className="font-black text-xs uppercase">{reviews[selectedReview].name}</h4>
                <p className="text-[9px] font-bold text-black/50 uppercase">{reviews[selectedReview].role}</p>
              </a>
            </div>
            <p className="text-base font-bold italic leading-snug">"{reviews[selectedReview].review}"</p>
          </div>
        </div>
      )}
    </section>
  );
}
