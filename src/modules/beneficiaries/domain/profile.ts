/** What an assistant needs to book a seat for a beneficiary. */
type Profile = {
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  birthPlace: string | null;
  phone: string | null;
  hasPassword: boolean;
};

/** Name as written on official documents: first name(s) then last name(s). */
export const displayName = ({
  firstName,
  lastName,
}: Pick<Profile, "firstName" | "lastName">) =>
  `${firstName} ${lastName}`.trim();

/** A request can be published only for a complete profile. */
export const isReadyToBook = (profile: Profile) =>
  Boolean(
    profile.firstName &&
      profile.lastName &&
      profile.birthDate &&
      profile.birthPlace &&
      profile.phone &&
      profile.hasPassword,
  );
