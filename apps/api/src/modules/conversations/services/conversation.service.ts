import { ConversationRepository } from '../repositories/conversation.repository.js';
import type { ConversationState } from '../entities/conversation.entity.js';

export class ConversationService {
  constructor(private readonly conversationRepository = new ConversationRepository()) {}

  upsertByCustomerId(customerId: string) {
    return this.conversationRepository.upsertByCustomerId(customerId);
  }

  updateState(conversationId: string, state: ConversationState, lastQuestion?: string | null) {
    return this.conversationRepository.updateState(conversationId, state, lastQuestion);
  }
}
