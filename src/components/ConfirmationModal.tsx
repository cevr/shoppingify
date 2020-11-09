import { MdClose } from "react-icons/md";
import { Portal } from "./Portal";

interface ConfirmationModalProps {
  open?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title: string;
}

export let ConfirmationModal = ({
  open,
  title,
  onClose,
  onConfirm,
}: ConfirmationModalProps) => {
  return open ? (
    <Portal>
      <>
        <div className="fixed bg-black opacity-25 inset-0" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative bg-white p-8 rounded-xl flex flex-col">
            <button
              onClick={onClose}
              className="absolute text-2xl text-gray-500 p-2 top-0 right-0 mr-2 mt-2"
            >
              <MdClose />
            </button>
            <h1 className="text-xl w-3/4 mb-10">{title}</h1>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-4 rounded-lg mr-2 hover:bg-gray-200"
              >
                cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-4 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </>
    </Portal>
  ) : null;
};
