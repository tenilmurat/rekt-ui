'use client';

/* Source: Animate UI — https://animate-ui.com/docs/icons · MIT License.
   Fetched from https://animate-ui.com/r/icons-chevron-left.json and included verbatim.
   A Lucide icon animated with Motion, by Skyleen. See NOTICE.md in
   components/animate-ui. */

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

type ChevronLeftProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: {
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: -4,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, -4, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChevronLeftProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path
        d="m15 18-6-6 6-6"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ChevronLeft(props: ChevronLeftProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChevronLeft,
  ChevronLeft as ChevronLeftIcon,
  type ChevronLeftProps,
  type ChevronLeftProps as ChevronLeftIconProps,
};
