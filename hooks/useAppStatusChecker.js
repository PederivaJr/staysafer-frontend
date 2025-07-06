import { useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const useAppStatusChecker = () => {
  const { authTokenChecked, initCalled, storageCheckedForLang, setAppLoading } =
    useContext(AuthContext);

  useEffect(() => {
    if (authTokenChecked && initCalled && storageCheckedForLang) {
      setAppLoading(false);
    }
  }, [authTokenChecked, initCalled, storageCheckedForLang]);
};

export default useAppStatusChecker;
