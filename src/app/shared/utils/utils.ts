import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '@core/models/interface/api-error';
import { MessageService } from '@core/services/message.service';

export const POST_PLACEHOLDER = {
  id: '',
  title: '',
  content: '',
  author: '',
  slug: '',
  createdAt: new Date(),
  username: '',
  communityName: '',
  communityId: '',
  totalComment: 0,
  comments: [],
  reactions: [],
  userReactionsIds: [],
  totalReactions: 0,
};

export function handleHttpError(error: HttpErrorResponse, messageService: MessageService) {
  if (error.error instanceof ErrorEvent) {
    messageService.showMessage('error', error.error.message);
    console.error(error.error.message);
  } else if (error.error && typeof error.error === 'object') {
    const apiError = error.error as ApiError;
    const errorMessage = apiError.detail ?? error.message;

    messageService.showMessage('error', errorMessage);
    console.error('An error occurred: ', apiError);
  } else {
    console.error('Http error occured: ', error);
  }
}
