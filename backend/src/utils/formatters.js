/**
 * Response shape helpers — strip sensitive fields and normalize Decimal types
 */

function publicUser(user) {
  return {
    id: user.id,
    accountId: user.accountId,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    language: user.language,
    verificationStatus: user.verificationStatus,
  };
}

function machineryResponse(machine, distance = null) {
  const { owner, ...machineData } = machine;
  return {
    ...machineData,
    pricePerHour: Number(machine.pricePerHour),
    pricePerDay: machine.pricePerDay == null ? null : Number(machine.pricePerDay),
    distance: distance == null ? null : Number(distance.toFixed(2)),
    owner: owner ? publicUser(owner) : undefined,
  };
}

function bookingResponse(booking) {
  const { farmer, driver, machinery, payment, ...bookingData } = booking;
  return {
    ...bookingData,
    totalAmount: Number(booking.totalAmount),
    advanceAmount: Number(booking.advanceAmount),
    deliveryFee: Number(booking.deliveryFee),
    operatorFee: Number(booking.operatorFee),
    farmer: farmer ? publicUser(farmer) : undefined,
    driver: driver ? publicUser(driver) : null,
    machinery: machinery ? machineryResponse(machinery) : undefined,
    payment: payment ? { ...payment, amount: Number(payment.amount) } : undefined,
  };
}

module.exports = { publicUser, machineryResponse, bookingResponse };
