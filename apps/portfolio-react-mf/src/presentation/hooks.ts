import { useState, useEffect, useMemo, useCallback } from 'react';
import { Count, Level, Message, PortfolioData } from '../domain/entities';
import {
  IncrementClickUseCase,
  SendMultiTabMessageUseCase,
  ProcessTabMessageUseCase,
  ProcessMultiTabMessageUseCase,
  GetPortfolioUseCase,
} from '../application/use-cases';
import { InfrastructureFactory } from '../infrastructure/adapters';
import type { IMessageRepository } from '../application/ports';
import { MF_CONFIG } from '@mf/shared';

export interface UsePortfolioResult {
  data: PortfolioData | null;
  isLoading: boolean;
  error: Error | null;
}

export function usePortfolio(): UsePortfolioResult {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    const useCase = new GetPortfolioUseCase(InfrastructureFactory.createPortfolioRepository());

    useCase.execute()
      .then(result => { if (!cancelled) setData(result); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { data, isLoading, error };
}

// Messaging Hooks

export function useClickCounter(instanceId: string) {
  const [count, setCount] = useState<Count>(new Count(0));

  const level = useMemo(() => Level.fromCount(count.raw), [count]);

  const incrementUseCase = useMemo(() => {
    const eventBus = InfrastructureFactory.createEventBus();
    return new IncrementClickUseCase(eventBus, instanceId);
  }, [instanceId]);

  const increment = useCallback(() => {
    setCount(prev => incrementUseCase.execute(prev));
  }, [incrementUseCase]);

  const sendToTab = useCallback(() => {
    incrementUseCase.execute(count);
  }, [count, incrementUseCase]);

  const sendToMultiTab = useCallback(() => {
    const channel = InfrastructureFactory.createBroadcastChannel();
    const tabId = InfrastructureFactory.getTabId();
    new SendMultiTabMessageUseCase(channel, tabId, instanceId).execute(count);
  }, [count, instanceId]);

  return {
    count: count.raw,
    level: level.value,
    levelClass: level.cssClass,
    increment,
    sendToTab,
    sendToMultiTab,
  };
}

export function useMessageListener(instanceId: string, messageRepository: IMessageRepository) {
  const [externalClicks, setExternalClicks] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const eventBus = InfrastructureFactory.createEventBus();
    const channel = InfrastructureFactory.createBroadcastChannel();
    const validator = InfrastructureFactory.createMessageValidator();
    const tabId = InfrastructureFactory.getTabId();

    const tabUseCase = new ProcessTabMessageUseCase(validator, instanceId);
    const multiTabUseCase = new ProcessMultiTabMessageUseCase(validator, tabId);

    const tabHandler = (payload: unknown) => {
      const message = tabUseCase.execute(payload);
      if (!message) return;
      const data = payload as { source: string; count: number };
      if (data.source === 'react') setExternalClicks(data.count);
      messageRepository.add(message);
      setMessages(messageRepository.getRecent(MF_CONFIG.MAX_MESSAGES_IN_LOG));
    };

    const multiTabHandler = (event: MessageEvent) => {
      const message = multiTabUseCase.execute(event.data);
      if (!message) return;
      messageRepository.add(message);
      setMessages(messageRepository.getRecent(MF_CONFIG.MAX_MESSAGES_IN_LOG));
    };

    eventBus.on('click-count', tabHandler);
    channel.addEventListener('message', multiTabHandler);

    return () => {
      eventBus.off('click-count', tabHandler);
      channel.removeEventListener('message', multiTabHandler);
    };
  }, [instanceId, messageRepository]);

  return { externalClicks, messages };
}
