import ModalWrapper from "./ModalWrapper";

const RemoveAssociationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h3 className="text-white text-lg font-semibold mb-4">
        Are you sure you want to remove this note association?
      </h3>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
        >
          No
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Yes
        </button>
      </div>
    </ModalWrapper>
  );
};

export default RemoveAssociationModal;
