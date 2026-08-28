import { Alert } from "react-native";

import { useAuth } from "../../contexts";
import { usersService } from "../../api";
import { getPartner } from "../../utils";
import { useForm } from "../use-form.hook";
import { useTranslate } from "../i18n";

export const useLinkPartner = () => {
  const { t } = useTranslate();
  const { me, refreshMe } = useAuth();
  const partner = getPartner(me);
  const isLinked = !!me?.pair;

  const form = useForm({
    initialValues: { partnerUsername: "" },
    validate: (values) => {
      const errors: any = {};
      if (!values.partnerUsername.trim()) {
        errors.partnerUsername = t("partner.errors.usernameRequired");
      }
      return errors;
    },
    onSubmit: async (values) => {
      await usersService.linkPartner(values.partnerUsername.trim());
      await refreshMe();
      Alert.alert(t("common.success"), t("partner.linkSuccessMessage"));
      form.reset();
    },
  });

  const handleLink = async () => {
    try {
      await form.handleSubmit();
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("partner.errors.linkFailed"),
      );
    }
  };

  return {
    partner,
    partnerUsername: form.values.partnerUsername,
    setPartnerUsername: (text: string) =>
      form.setFieldValue("partnerUsername", text),
    loading: form.isSubmitting,
    handleLink,
    isLinked,
  };
};
