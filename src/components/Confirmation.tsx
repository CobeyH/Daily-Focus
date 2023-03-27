import { useState } from "react";
import "./Focus.css";

function Confirmation({
  title,
  body,
  type,
  callback,
  children,
  invert = false,
  confirmText,
  disabled = false,
}: {
  title: string;
  body: any;
  type?: string;
  callback: any;
  children?: any;
  invert?: boolean;
  confirmText?: string;
  disabled?: boolean;
}) {
  const [modal, setModal] = useState(false);

  function handleFormCancel() {
    setModal(!modal);
  }

  return (
    <>
      <button
        className={type || "action-button"}
        onClick={() => setModal(!modal)}
        disabled={disabled}
        style={{ zIndex: 1 }}
      >
        {children}
      </button>
      <dialog open={modal}>
        <article className="modal">
          <h1 style={{marginBottom: 30}}>{title}</h1>
          <div>{body}</div>
          <footer style={{ display: "flex" }}>
            <button
              role="button"
              onClick={handleFormCancel}
              className={invert ? "secondary" : ""}
            >
              Cancel
            </button>
            <button
              role="button"
              className={invert ? "" : "secondary"}
              onClick={() => {
                callback();
                setModal(false);
              }}
            >
              {confirmText || "Confirm"}
            </button>
          </footer>
        </article>
      </dialog>
    </>
  );
}

export default Confirmation;
