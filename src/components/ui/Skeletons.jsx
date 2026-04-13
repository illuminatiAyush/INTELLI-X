import React from 'react'

const SkeletonBase = ({ className }) => (
  <div className={`animate-pulse bg-[var(--bg-card)] rounded-2xl ${className}`} />
)

export const CardSkeleton = () => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-8 rounded-[2rem] space-y-6">
    <div className="flex justify-between items-start">
      <SkeletonBase className="w-14 h-14 rounded-2xl" />
      <SkeletonBase className="w-24 h-6 rounded-lg" />
    </div>
    <div className="space-y-3">
      <SkeletonBase className="w-2/3 h-10 rounded-xl" />
      <SkeletonBase className="w-1/2 h-5 rounded-lg" />
    </div>
  </div>
)

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2rem] overflow-hidden">
    <div className="p-6 border-b border-[var(--border-subtle)] flex gap-4">
      <SkeletonBase className="w-32 h-8 rounded-xl" />
      <SkeletonBase className="w-48 h-8 ml-auto rounded-xl" />
    </div>
    <div className="p-8 space-y-6">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {[...Array(cols)].map((_, j) => (
            <SkeletonBase key={j} className={`h-6 rounded-lg ${j === 0 ? 'w-1/3' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  </div>
)

export const ListSkeleton = ({ items = 4 }) => (
  <div className="space-y-4">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-5 rounded-[2rem] bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <SkeletonBase className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="w-1/3 h-5 rounded-lg" />
          <SkeletonBase className="w-1/4 h-3 rounded-md" />
        </div>
        <SkeletonBase className="w-16 h-8 rounded-xl" />
      </div>
    ))}
  </div>
)

export const DashboardSkeleton = () => (
  <div className="flex flex-col gap-10">
    <div className="flex justify-between items-end">
      <div className="space-y-3">
        <SkeletonBase className="w-56 h-12 rounded-2xl" />
        <SkeletonBase className="w-80 h-5 rounded-xl" />
      </div>
      <SkeletonBase className="w-40 h-12 rounded-2xl" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <TableSkeleton rows={6} />
      </div>
      <div className="space-y-8">
        <SkeletonBase className="w-full h-[450px] rounded-[2rem]" />
      </div>
    </div>
  </div>
)

export const TestAttemptSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-10">
    <div className="h-24 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-subtle)] animate-pulse" />
    <div className="flex flex-wrap gap-3">
      {[...Array(12)].map((_, i) => (
        <SkeletonBase key={i} className="w-12 h-12 rounded-2xl" />
      ))}
    </div>
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[3rem] p-10 space-y-12">
      <div className="flex gap-6">
        <SkeletonBase className="w-14 h-14 rounded-2xl shrink-0" />
        <SkeletonBase className="h-8 w-3/4 mt-3 rounded-xl" />
      </div>
      <div className="space-y-5">
        {[...Array(4)].map((_, i) => (
          <SkeletonBase key={i} className="h-20 w-full rounded-[2rem]" />
        ))}
      </div>
      <div className="pt-10 border-t border-[var(--border-subtle)] flex justify-between items-center">
        <SkeletonBase className="h-12 w-36 rounded-2xl" />
        <SkeletonBase className="h-5 w-28 rounded-xl" />
        <SkeletonBase className="h-12 w-36 rounded-2xl" />
      </div>
    </div>
  </div>
)

export default {
  Base: SkeletonBase,
  Card: CardSkeleton,
  Table: TableSkeleton,
  List: ListSkeleton,
  Dashboard: DashboardSkeleton,
  TestAttempt: TestAttemptSkeleton
}

