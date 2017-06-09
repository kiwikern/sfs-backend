const userSanitizer = require('../user/user-sanitizer.js');

describe(`UserSanitizer`, () => {

  it('should return false for null', () => {
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(null);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for empty object', () => {
    const user = {}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for user without mail or name', () => {
    const user = {password: '123456'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for user without password', () => {
    const user = {userName: 'hallo'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for user without password', () => {
    const user = {userName: 'hallo', mailAddress: 'mail@kim.de'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for user with invalid mail', () => {
    const user = {mailAddress: 'mail@', password: 'jadsla8a(Asb)'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for user with invalid name', () => {
    const user = {userName: 'Y>ism L', password: 'jadsla8a(Asb)'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for empty username', () => {
    const user = {userName: '', password: 'jadsla8a(Asb)'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for short password', () => {
    const user = {userName: 'hallo', password: '12345'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for empty password', () => {
    const user = {userName: 'test', password: ''}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for null password', () => {
    const user = {userName: 'test', password: null}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return false for user without password', () => {
    const user = {mailAddress: 'mail@kim.de'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toBe(false);
  });

  it('should return user for user + password', () => {
    const user = {userName: 'hi', mailAddress: null, password: 'Ajsn8nsjlL'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    expect(normalizedUser).toEqual(user);
  });

  it('should return user for user + password', () => {
    const user = {userName: 'hi', password: 'Ajsn8nsjlL'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    user.mailAddress = null;
    expect(normalizedUser).toEqual(user);
  });

  it('should return user for user + mailAddress', () => {
    const user = {mailAddress: 'da@sas.de', password: 'Ajsn8nsjlL'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    user.userName = null;
    expect(normalizedUser).toEqual(user);
  });

  it('should return user for user + mailAddress', () => {
    const user = {userName: ' D ', mailAddress: 'DA@SAS.DE', password: 'Ajsn8nsjlL'}
    const normalizedUser = userSanitizer.getNormalizedUserIfValid(user);
    user.userName = 'D';
    user.mailAddress = 'da@sas.de'
    expect(normalizedUser).toEqual(user);
  });

});
