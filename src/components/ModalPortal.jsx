import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/ModalPortal.css';

function ModalPortal({ children }) {
  useEffect(() => {
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = prevOverflow;
    };
  }, []);

  return createPortal(children, document.body);
}

export default ModalPortal;
