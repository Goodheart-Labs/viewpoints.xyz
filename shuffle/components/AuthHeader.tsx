import { useCallback } from "react";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import BorderedButton from "./BorderedButton";
import { Auth } from "@supabase/auth-ui-react";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useModal } from "@/providers/ModalProvider";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const AuthHeader = () => {
  const { setModal } = useModal();
  const { client } = useSupabase();

  const onClickLogin = useCallback(() => {
    setModal({
      render: () => (
        <Auth
          onlyThirdPartyProviders
          supabaseClient={client}
          appearance={{ theme: ThemeSupa }}
          providers={["apple", "google", "facebook", "twitter"]}
        />
      ),
    });
  }, [client, setModal]);

  useHotkeys(["l", "shift+l"], onClickLogin);

  return (
    <div className="flex justify-end p-4">
      <BorderedButton color="indigo" onClick={onClickLogin}>
        Login
      </BorderedButton>
    </div>
  );
};

export default AuthHeader;
