import client from "./clientController";

const updateProfile = (
  id,
  firstname,
  lastname,
  email,
  phone_number,
  company,
  old_password,
  password,
  confirm_password,
  token
) =>
  client.put(`/user/${id}`, {
    id,
    firstname,
    lastname,
    email,
    phone_number,
    company,
    old_password,
    password,
    confirm_password,
    token,
  });

export default {
  updateProfile,
};
