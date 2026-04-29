"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";

const stats = [
  {
    value: 111,
    suffix: "M+",
    label: "Annual visitors",
    detail: "Record 2024 footfall",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
    alt: "Downtown Dubai and Dubai Mall district"
  },
  {
    value: 1200,
    suffix: "+",
    label: "Stores",
    detail: "Global retail ecosystem",
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200&q=85",
    alt: "Luxury retail displays inside a shopping destination"
  },
  {
    value: 200,
    suffix: "+",
    label: "Dining outlets",
    detail: "From flagship cafes to fine dining",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85",
    alt: "Premium dining table setting"
  }
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1800, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    return spring.on("change", (latest) => setDisplay(Math.round(latest)));
  }, [spring]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section id="stats" className="section-shell flex items-center bg-[#080808] py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="mb-16 max-w-4xl"
        >
          <p className="deck-kicker mb-5 text-emerald/80">
            02 / Proven gravity
          </p>
          <h2 className="text-balance text-4xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl">
            A destination with audience at planetary scale.
          </h2>
        </motion.div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 shadow-glow md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: index * 0.08 }}
              className="group relative min-h-[380px] overflow-hidden bg-black p-8 sm:p-10"
            >
              <Image
                src={stat.image}
                alt={stat.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover opacity-62 transition duration-700 group-hover:scale-105 group-hover:opacity-78"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/58 to-black/20" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(215,180,106,0.2),transparent_36%)]" />
              <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-end">
                <p className="text-6xl font-semibold leading-none text-white drop-shadow-2xl sm:text-7xl lg:text-8xl">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <h3 className="mt-8 text-2xl font-medium text-white">{stat.label}</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-white/72">{stat.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 grid gap-3 text-xs uppercase tracking-[0.24em] text-white/38 md:grid-cols-3">
          <p>Source-led partner narrative</p>
          <p className="md:text-center">Global tourism + daily retail</p>
          <p className="md:text-right">Designed for sponsor conversion</p>
        </div>
      </Container>
    </section>
  );
}
