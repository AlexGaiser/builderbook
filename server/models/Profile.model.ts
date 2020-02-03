import Email from "./Email.model";
import Photo from "./Photo.model";

export default interface Profile {
  id: string;
  displayName: string;
  emails: Email[];
  photos: Photo[];
}
