import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { Subject, type Observable } from 'rxjs'

interface StreamEntry {
  subject: Subject<MessageEvent>
  createdAt: number
}

@Injectable()
export class SseStreamRegistry implements OnModuleDestroy {
  private readonly streams = new Map<string, Set<StreamEntry>>()

  register(trackId: string): {
    stream$: Observable<MessageEvent>
    unregister: () => void
  } {
    const entry: StreamEntry = {
      subject: new Subject<MessageEvent>(),
      createdAt: Date.now()
    }

    const existing = this.streams.get(trackId)
    if (existing) {
      existing.add(entry)
    } else {
      this.streams.set(trackId, new Set([entry]))
    }

    return {
      stream$: entry.subject.asObservable(),
      unregister: () => {
        entry.subject.complete()
        this.streams.get(trackId)?.delete(entry)
        if (this.streams.get(trackId)?.size === 0) {
          this.streams.delete(trackId)
        }
      }
    }
  }

  emit(trackId: string, event: MessageEvent): void {
    const entries = this.streams.get(trackId)
    if (!entries) return
    for (const entry of entries) {
      entry.subject.next(event)
    }
  }

  getActiveStreamCount(): number {
    let count = 0
    for (const entries of this.streams.values()) {
      count += entries.size
    }
    return count
  }

  onModuleDestroy(): void {
    for (const entries of this.streams.values()) {
      for (const entry of entries) {
        entry.subject.complete()
      }
    }
    this.streams.clear()
  }
}
