"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Network,
  Users,
} from "lucide-react";

/* =========================================================
   SMOOTH COUNT-UP
   ========================================================= */

function CountUp({
  value,
  duration = 10000,
}: {
  value: number;
  duration?: number;
}) {
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const numberRef = useRef<HTMLSpanElement | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimatedRef.current) {
          return;
        }

        hasAnimatedRef.current = true;

        // Always begin visually at zero.
        if (numberRef.current) {
          numberRef.current.textContent = "0";
        }

        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;

          /*
           * Linear progress means the counter moves continuously
           * throughout the entire 10-second period.
           *
           * 0 seconds  -> 0
           * 5 seconds  -> ~50%
           * 10 seconds -> exact final value
           */
          const progress = Math.min(elapsed / duration, 1);

          const currentValue = Math.floor(value * progress);

          if (numberRef.current) {
            numberRef.current.textContent =
              currentValue.toLocaleString("en-US");
          }

          if (progress < 1) {
            animationFrameRef.current =
              requestAnimationFrame(animate);
          } else {
            // Guarantee exact final number.
            if (numberRef.current) {
              numberRef.current.textContent =
                value.toLocaleString("en-US");
            }

            animationFrameRef.current = null;
          }
        };

        animationFrameRef.current =
          requestAnimationFrame(animate);

        observer.disconnect();
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(wrapper);

    return () => {
      observer.disconnect();

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  /*
   * When a new value arrives after the count-up already ran (e.g.
   * live stats resolve after the animation), snap to it instead of
   * leaving the previous number on screen.
   */
  useEffect(() => {
    if (hasAnimatedRef.current && numberRef.current) {
      numberRef.current.textContent =
        value.toLocaleString("en-US");
    }
  }, [value]);

  return (
    <span
      ref={wrapperRef}
      className="inline-block"
    >
      <span ref={numberRef}>0</span>
    </span>
  );
}

/* =========================================================
   LIVE PLATFORM METRICS
   ========================================================= */

type PlatformStats = {
  users: number;
  papers: number;
  entities: number;
};

type MetricStatus =
  | "loading"
  | "ready"
  | "error";

const metricDefs: Array<{
  key: keyof PlatformStats;
  icon: typeof Users;
  label: string;
  detail: string;
}> = [
  {
    key: "users",
    icon: Users,
    label: "researchers on BioLayers",
    detail:
      "Every BioLayers account — researchers mapping cancer mechanisms from the literature.",
  },
  {
    key: "papers",
    icon: FileText,
    label: "papers analyzed",
    detail:
      "Papers uploaded in the workspace and turned into structured, evidence-linked mind maps.",
  },
  {
    key: "entities",
    icon: Network,
    label: "entities mapped",
    detail:
      "Cells, genes, proteins, pathways and processes mapped across every saved mind map.",
  },
];

function metricSource(status: MetricStatus): string {
  if (status === "ready") {
    return "Live from the BioLayers platform";
  }

  if (status === "loading") {
    return "Loading live data";
  }

  return "Live data unavailable";
}

/* =========================================================
   PROBLEM SECTION
   ========================================================= */

export default function ProblemSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [status, setStatus] = useState<MetricStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/platform-stats")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            `Platform stats request failed: ${res.status}`,
          );
        }

        return res.json() as Promise<PlatformStats>;
      })
      .then((data) => {
        if (cancelled) return;

        setStats(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="
        relative
        isolate
        overflow-hidden
        border-t
        border-teal-100/[0.045]
        bg-[#04070a]
        px-6
        py-28
        md:px-10
        md:py-36
        lg:px-16
        lg:py-44
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND GLOWS                                 */}
      {/* ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[42%]
          -z-10
          h-[800px]
          w-[800px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-teal-400/[0.055]
          blur-[180px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-200px]
          top-[20%]
          -z-10
          h-[500px]
          w-[500px]
          rounded-full
          bg-sky-400/[0.045]
          blur-[160px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-250px]
          left-[-150px]
          -z-10
          h-[550px]
          w-[550px]
          rounded-full
          bg-indigo-400/[0.035]
          blur-[170px]
        "
      />

      {/* Subtle horizontal grid */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
          opacity-[0.025]
        "
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "100% 80px",
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* ================================================= */}
        {/* SECTION LABEL                                    */}
        {/* ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.4,
          }}
          transition={{
            duration: 0.7,
          }}
          className="
            mb-7
            text-sm
            font-medium
            uppercase
            tracking-[0.3em]
            text-teal-200/80
          "
        >
          The research problem
        </motion.div>

        {/* ================================================= */}
        {/* HEADLINE                                         */}
        {/* ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 26,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.85,
            delay: 0.08,
          }}
          className="max-w-6xl"
        >
          <h2
            className="
              text-4xl
              font-semibold
              leading-[1.03]
              tracking-[-0.045em]
              text-white
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
              xl:text-[78px]
            "
          >
            Cancer research isn&apos;t short on information.

            <span
              className="
                mt-2
                block
                bg-gradient-to-r
                from-teal-200
                via-cyan-200
                to-sky-300
                bg-clip-text
                text-transparent
              "
            >
              It&apos;s short on connection.
            </span>
          </h2>

          <p
            className="
              mt-9
              max-w-4xl
              text-base
              leading-8
              text-slate-300/80
              md:text-lg
              md:leading-9
            "
          >
            Cancer research spans millions of publications
            and thousands of molecular pathways.
            Understanding disease mechanisms requires
            connecting evidence across genes, proteins,
            cells, pathways and biological processes.
          </p>
        </motion.div>

        {/* ================================================= */}
        {/* VERIFIED METRICS                                 */}
        {/* ================================================= */}

        <div
          className="
            mt-20
            grid
            gap-5
            md:grid-cols-3
          "
        >
          {metricDefs.map((item, index) => {
            const Icon = item.icon;
            const value = stats?.[item.key] ?? 0;
            const source = metricSource(status);

            return (
              <motion.div
                key={item.label}
                initial={{
                  opacity: 0,
                  y: 30,
                  scale: 0.985,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                  amount: 0.3,
                }}
                transition={{
                  duration: 0.75,
                  delay: 0.12 + index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -5,
                }}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-teal-100/[0.085]
                  bg-[#0a0f14]/58
                  p-7
                  backdrop-blur-2xl
                  transition-colors
                  duration-500
                  hover:border-teal-100/[0.16]
                  hover:bg-[#10161d]/72
                  md:p-8
                "
              >
                {/* Hover gradient */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-teal-400/[0.055]
                    via-transparent
                    to-sky-400/[0.045]
                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                />

                {/* Top highlight */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    left-8
                    right-8
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-teal-100/20
                    to-transparent
                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                />

                <div className="relative">
                  {/* ================================================= */}
                  {/* ICON + EXTERNAL LINK                              */}
                  {/* ================================================= */}

                  <div className="flex items-start justify-between">
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-teal-100/[0.08]
                        bg-teal-100/[0.035]
                      "
                    >
                      <Icon
                        className="
                          h-5
                          w-5
                          text-teal-50/75
                        "
                      />
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* 10-SECOND NUMBER                                  */}
                  {/* ================================================= */}

                  <div
                    className="
                      mt-10
                      min-h-[52px]
                      overflow-hidden
                      tabular-nums
                      text-[38px]
                      font-semibold
                      leading-none
                      tracking-[-0.045em]
                      text-white
                      sm:text-[42px]
                      lg:text-[46px]
                    "
                  >
                    <CountUp
                      value={value}
                      duration={1200}
                    />
                  </div>

                  {/* ================================================= */}
                  {/* LABEL                                             */}
                  {/* ================================================= */}

                  <div
                    className="
                      mt-4
                      text-[15px]
                      font-medium
                      leading-6
                      text-slate-200/85
                    "
                  >
                    {item.label}
                  </div>

                  {/* ================================================= */}
                  {/* DESCRIPTION                                       */}
                  {/* ================================================= */}

                  <div
                    className="
                      mt-1
                      max-w-[290px]
                      text-sm
                      leading-6
                      text-slate-400/80
                    "
                  >
                    {item.detail}
                  </div>

                  {/* ================================================= */}
                  {/* SOURCE                                            */}
                  {/* ================================================= */}

                  <div
                    className="
                      mt-7
                      border-t
                      border-teal-100/[0.065]
                      pt-5
                      text-[11px]
                      font-medium
                      uppercase
                      leading-5
                      tracking-[0.12em]
                      text-slate-500/80
                      transition-colors
                      duration-300
                      group-hover:text-slate-300/80
                    "
                  >
                    {source}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ================================================= */}
        {/* BIOLAYERS APPROACH                               */}
        {/* ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 26,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.85,
            delay: 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            relative
            mt-20
            overflow-hidden
            rounded-[28px]
            border
            border-teal-100/[0.085]
            bg-[#0a0f14]/58
            p-8
            backdrop-blur-2xl
            md:p-10
            lg:p-12
          "
        >
          {/* Inner glow */}

          <div
            className="
              pointer-events-none
              absolute
              right-[-150px]
              top-1/2
              h-[350px]
              w-[350px]
              -translate-y-1/2
              rounded-full
              bg-teal-400/[0.055]
              blur-[120px]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              items-start
              justify-between
              gap-10
              lg:flex-row
              lg:items-center
            "
          >
            <div className="max-w-3xl">
              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.28em]
                  text-slate-500
                "
              >
                BioLayers approach
              </p>

              <h3
                className="
                  mt-4
                  text-2xl
                  font-medium
                  leading-tight
                  tracking-[-0.03em]
                  text-white
                  md:text-3xl
                  lg:text-4xl
                "
              >
                Turn fragmented literature into
                evidence-linked biological mechanisms.
              </h3>

              <p
                className="
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-400/85
                  md:text-base
                "
              >
                BioLayers connects molecular evidence
                across cells, genes, proteins, pathways
                and disease processes so researchers can
                move from isolated findings toward
                interpretable mechanistic maps.
              </p>
            </div>

            <a
              href="#capabilities"
              className="
                group/button
                inline-flex
                shrink-0
                items-center
                gap-2
                rounded-full
                border
                border-teal-100/[0.14]
                bg-teal-100/[0.055]
                px-6
                py-3.5
                text-sm
                font-medium
                text-white
                transition
                duration-300
                hover:border-teal-100/[0.24]
                hover:bg-teal-100/[0.10]
              "
            >
              See how it works

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover/button:translate-x-1
                "
              />
            </a>
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* SCIENTIFIC NOTE                                  */}
        {/* ================================================= */}

        <motion.p
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
          }}
          className="
            mx-auto
            mt-7
            max-w-4xl
            text-center
            text-[11px]
            leading-6
            text-slate-500/75
          "
        >
          These capabilities are built into the BioLayers workspace today.
          Results are AI-generated and always returned with their source
          evidence so you can verify what supports each relationship.
        </motion.p>
      </div>
    </section>
  );
}