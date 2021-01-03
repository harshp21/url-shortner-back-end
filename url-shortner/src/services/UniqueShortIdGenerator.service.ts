import ShortUniqueId from "short-unique-id";

class UniqueShortIdGeneratorService {

    public generateUniqueId(): string {
        let uid = new ShortUniqueId();
        return uid();
    }
}

export { UniqueShortIdGeneratorService };