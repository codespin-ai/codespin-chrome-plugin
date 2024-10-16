import * as webjsx from "webjsx";
import { Connection } from "../chatGPT/components/Connection.js";
import {
  ConnectionInfo,
  ErrorResult,
  FAILED_TO_CONNECT,
  MISSING_KEY,
  UNAUTHORIZED,
} from "../messageTypes.js";
import { ModalDialog } from "../chatGPT/components/ModalDialog.js";
import { ModalMessage } from "../chatGPT/components/ModalMessage.js";

export async function validateConnection<TResult, TError extends string>(
  result: ErrorResult<TError>,
  whenFetchError: (
    cause: typeof MISSING_KEY | typeof UNAUTHORIZED
  ) => Promise<TResult>
): Promise<TResult | void> {
  if (!result.success) {
    if (resultIsConnectionIssue(result)) {
      const connectionInfo = await new Promise<ConnectionInfo | undefined>(
        (resolve) => {
          const connectionForm = webjsx.createNode(
            <codespin-connection resolve={resolve} />
          ) as Connection;
          document.body.appendChild(connectionForm);
        }
      );

      if (connectionInfo) {
        return await whenFetchError(result.error);
      }
    } else {
      if (result.error === FAILED_TO_CONNECT) {
        await new Promise<void>((resolve) => {
          const connectionForm = webjsx.createNode(
            <codespin-modal-message
              title="Failed to Connecter"
              message="Could not connect. Check if you're running the codefix server
                  in the project directory."
              resolve={resolve}
            ></codespin-modal-message>
          ) as ModalMessage;
          document.body.appendChild(connectionForm);
        });
      }
    }
  }
}

function resultIsConnectionIssue(
  result: ErrorResult<string>
): result is ErrorResult<typeof MISSING_KEY | typeof UNAUTHORIZED> {
  return result.error === MISSING_KEY || result.error === UNAUTHORIZED;
}
