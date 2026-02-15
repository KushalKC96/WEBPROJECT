exports.validateUserInput = (data) => {
    const errors = {};
    if (!data.username || data.username.trim() === '') {
        errors.username = 'Username is required';
    }
    if (!data.password || data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    }
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = 'Email is invalid';
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

exports.validateProductInput = (data) => {
    const errors = {};
    if (!data.name || data.name.trim() === '') {
        errors.name = 'Product name is required';
    }
    if (!data.price || isNaN(data.price) || data.price <= 0) {
        errors.price = 'Price must be a positive number';
    }
    if (!data.category || data.category.trim() === '') {
        errors.category = 'Category is required';
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

exports.validateRentalInput = (data) => {
    const errors = {};
    if (!data.toolId || data.toolId.trim() === '') {
        errors.toolId = 'Tool ID is required';
    }
    if (!data.rentalDuration || isNaN(data.rentalDuration) || data.rentalDuration <= 0) {
        errors.rentalDuration = 'Rental duration must be a positive number';
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};