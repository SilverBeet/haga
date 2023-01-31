import { PropsWithChildren } from "react";
import ReactDOM from "react-dom";

const Portal: React.FC<PropsWithChildren> = ({ children }) => {
    return ReactDOM.createPortal(
        children,
        document.body
    );
}

export default Portal;